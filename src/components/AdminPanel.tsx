/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Eye, Edit3, Trash2, Check, AlertTriangle, RefreshCcw, BarChart3, Database, Sparkles, Search, Clock } from 'lucide-react';
import { Submission, SubmissionStatus } from '../types';

interface AdminPanelProps {
  submissions: Submission[];
  onUpdateStatus: (id: string, newStatus: SubmissionStatus, adminNote?: string) => void;
  onDeleteSubmission: (id: string) => void;
  onSelectTracking: (id: string) => void;
  onSpeak: (text: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  submissions,
  onUpdateStatus,
  onDeleteSubmission,
  onSelectTracking,
  onSpeak
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<SubmissionStatus>('DIAJUKAN');
  const [adminNotes, setAdminNotes] = useState('');

  // Hitung jumlah hari kerja (Senin-Jumat) dari tanggal submit hingga sekarang (2026-06-02)
  const getElapsedBusinessDays = (submittedAtStr: string) => {
    try {
      const cleanStr = submittedAtStr.replace(' ', 'T');
      const submitDate = new Date(cleanStr);
      const now = new Date('2026-06-02T14:12:57Z'); // Gunakan format waktu referensi sistem agar konsisten
      if (isNaN(submitDate.getTime())) return 0;
      
      let businessDays = 0;
      let tempDate = new Date(submitDate.getTime());
      
      if (tempDate > now) return 0;

      while (tempDate < now) {
        const dayOfWeek = tempDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Bukan Minggu (0) dan Sabtu (6)
          businessDays++;
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }
      return businessDays;
    } catch (e) {
      return 0;
    }
  };

  const isUrgentSubmission = (sub: Submission) => {
    if (sub.status === 'SELESAI' || sub.status === 'DITOLAK') return false;
    return getElapsedBusinessDays(sub.submittedAt) > 5;
  };

  // Count helper
  const stats = {
    total: submissions.length,
    selesai: submissions.filter(s => s.status === 'SELESAI').length,
    proses: submissions.filter(s => s.status !== 'SELESAI' && s.status !== 'DITOLAK').length,
    ditolak: submissions.filter(s => s.status === 'DITOLAK').length,
    urgent: submissions.filter(s => s.status !== 'SELESAI' && s.status !== 'DITOLAK' && getElapsedBusinessDays(s.submittedAt) > 5).length,
  };

  const filteredSubmissions = submissions.filter(sub => {
    // 1. Status Filter
    if (filter !== 'ALL') {
      if (filter === 'URGENT') {
        if (!isUrgentSubmission(sub)) return false;
      } else if (sub.status !== filter) {
        return false;
      }
    }

    // 2. Keyword Search query filter (Id, nama pemohon, atau nama layanan)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchId = sub.id.toLowerCase().includes(q);
      const matchApplicant = sub.applicantName.toLowerCase().includes(q);
      const matchService = sub.serviceName.toLowerCase().includes(q);
      return matchId || matchApplicant || matchService;
    }

    return true;
  });

  const startChangingStatus = (sub: Submission) => {
    setSelectedSubId(sub.id);
    setNewStatus(sub.status);
    setAdminNotes(sub.timeline.find(t => t.status === sub.status)?.notes || '');
    onSpeak(`Mengedit status berkas ${sub.id}`);
  };

  const saveStatusChange = () => {
    if (!selectedSubId) return;

    onUpdateStatus(selectedSubId, newStatus, adminNotes);
    onSpeak(`Status berkas ${selectedSubId} berhasil diperbarui menjadi ${newStatus.replace('_', ' ')}.`);
    setSelectedSubId(null);
    setAdminNotes('');
  };

  return (
    <div className="space-y-8" id="admin-panel-container">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-slate-100 dark:border-stone-800 text-left">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Berkas Masuk</p>
          <p className="text-xl font-black text-slate-800 dark:text-stone-100 mt-1">{stats.total}</p>
          <span className="text-[9px] text-emerald-700 bg-emerald-50 dark:bg-stone-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono mt-2 inline-block">Database Terpusat</span>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-slate-100 dark:border-stone-800 text-left bg-gradient-to-br from-white to-rose-50/20 dark:from-stone-900 dark:to-rose-950/10">
          <p className="text-[10px] uppercase font-bold text-rose-500">Mendekati Tenggat</p>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.urgent}</p>
          <span className="text-[9px] text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 px-1.5 py-0.5 rounded font-mono mt-2 inline-block animate-pulse-subtle">
            {stats.urgent > 0 ? "⚠️ Tindakan Diperlukan" : "Aman Sejahtera"}
          </span>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-slate-100 dark:border-stone-800 text-left">
          <p className="text-[10px] uppercase font-bold text-slate-400">Selesai Diterbitkan</p>
          <p className="text-xl font-black text-green-700 dark:text-green-400 mt-1">{stats.selesai}</p>
          <span className="text-[9px] text-green-700 bg-green-50 dark:bg-stone-800 dark:text-green-300 px-1.5 py-0.5 rounded font-mono mt-2 inline-block">SK Keluar</span>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-slate-100 dark:border-stone-800 text-left">
          <p className="text-[10px] uppercase font-bold text-slate-400">Dalam Proses Review</p>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.proses}</p>
          <span className="text-[9px] text-amber-700 bg-amber-50 dark:bg-stone-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-mono mt-2 inline-block">Butuh Approval</span>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-slate-100 dark:border-stone-800 text-left">
          <p className="text-[10px] uppercase font-bold text-slate-400">Ditolak/Revisi</p>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.ditolak}</p>
          <span className="text-[9px] text-rose-700 bg-rose-50 dark:bg-stone-800 dark:text-rose-300 px-1.5 py-0.5 rounded font-mono mt-2 inline-block">Berkas Kurang</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main interactive table of submissions */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-slate-100 dark:border-stone-800 shadow-sm space-y-4">
          
          {/* Header and filters section */}
          <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-stone-800 pb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                Panel Admin: Manajemen Berkas Lapangan DLH
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Ubah status alur kerja warga, cari permohonan, atau pantau berkas yang melebihi batas waktu pelayanan.</p>
            </div>

            {/* Advanced Search & Filtering Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 w-full justify-between items-stretch md:items-center">
              {/* Search text input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Pemohon, Layanan, atau Kode Berkas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-950 text-slate-800 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  id="admin-search-input"
                />
              </div>

              {/* Status filter buttons pills */}
              <div className="flex flex-wrap gap-1 bg-slate-50 dark:bg-stone-950 p-1 rounded-xl border border-slate-100 dark:border-stone-850 self-start">
                {[
                  { key: 'ALL', label: 'Semua' },
                  { key: 'DIAJUKAN', label: 'Diajukan' },
                  { key: 'SURVEY_TEKNIS', label: 'Survei' },
                  { key: 'SELESAI', label: 'Selesai' },
                  { key: 'DITOLAK', label: 'Ditolak' },
                  { key: 'URGENT', label: '⏳ >5 Hari' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setFilter(opt.key);
                      onSpeak(`Menyaring berkas: ${opt.label}`);
                    }}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                      filter === opt.key 
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : opt.key === 'URGENT'
                        ? 'text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-stone-150'
                    }`}
                  >
                    {opt.label}
                    {opt.key === 'URGENT' && stats.urgent > 0 && (
                      <span className="ml-1 bg-rose-500 text-white rounded-full px-1.5 py-px text-[8px] font-mono animate-pulse">
                        {stats.urgent}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-stone-800 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-3 px-2">KODE BERKAS</th>
                  <th className="py-3 px-2">PEMOHON / PERUSAHAAN</th>
                  <th className="py-3 px-2">JENIS LAYANAN</th>
                  <th className="py-3 px-2 text-center">STATUS SEKARANG</th>
                  <th className="py-3 px-2 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-stone-850">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((sub) => {
                    const daysElapsed = getElapsedBusinessDays(sub.submittedAt);
                    const isUrgent = isUrgentSubmission(sub);

                    return (
                      <tr 
                        key={sub.id} 
                        className={`transition-colors duration-200 border-l-4 ${
                          isUrgent 
                            ? 'bg-rose-50/50 hover:bg-rose-100/75 dark:bg-rose-950/10 dark:hover:bg-rose-900/20 border-l-rose-500' 
                            : 'hover:bg-slate-50/50 dark:hover:bg-stone-850/30 border-l-transparent'
                        }`}
                      >
                        <td className="py-3.5 px-2 font-mono font-bold text-emerald-950 dark:text-emerald-400">
                          <div className="flex flex-col">
                            <span>{sub.id}</span>
                            {isUrgent && (
                              <span className="inline-flex items-center gap-1 text-[8px] font-black text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-950/60 px-1.5 py-0.5 rounded mt-1 shadow-sm w-fit animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-600 dark:text-rose-450 shrink-0" />
                                <span>KRITIS {daysElapsed} HARI KERJA</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="font-semibold text-slate-800 dark:text-stone-200">{sub.applicantName}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{sub.submittedAt}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-slate-600 dark:text-stone-400 max-w-[150px] truncate" title={sub.serviceName}>
                          {sub.serviceName}
                        </td>
                        <td className="py-3.5 px-2 text-center">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full font-mono ${
                            sub.status === 'SELESAI' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300' 
                              : sub.status === 'DITOLAK' 
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300'
                          }`}>
                            {sub.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onSelectTracking(sub.id)}
                              className="p-1 px-1.5 rounded text-indigo-600 hover:bg-indigo-50 dark:hover:bg-stone-800 text-[10px] font-bold transition flex items-center gap-0.5"
                              title="Tinjau Timeline Visual"
                            >
                              <Eye className="w-3" />
                              <span>Lacak</span>
                            </button>
                            <button
                              onClick={() => startChangingStatus(sub)}
                              className="p-1 px-1.5 rounded text-amber-600 hover:bg-amber-50 dark:hover:bg-stone-800 text-[10px] font-bold transition flex items-center gap-0.5"
                              title="Ubah Status Kerja"
                            >
                              <Edit3 className="w-3" />
                              <span>Ubah</span>
                            </button>
                            <button
                              onClick={() => {
                                onDeleteSubmission(sub.id);
                                onSpeak(`Menghapus berkas ${sub.id}`);
                              }}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-stone-800 transition"
                              title="Hapus Berkas dari Portal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      Tidak ada data berkas yang sesuai dengan kriteria filter atau kata kunci pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Change status dialog panel */}
        <div className="lg:col-span-4">
          {selectedSubId ? (
            <div className="bg-amber-500/5 dark:bg-stone-900 border-2 border-amber-500/20 p-5 rounded-2xl space-y-4 shadow-md text-slate-800 dark:text-stone-200">
              <h5 className="font-bold text-xs text-amber-850 dark:text-amber-400 block border-b border-amber-500/10 pb-2">
                ✒️ Perbarui Status Berkas {selectedSubId}
              </h5>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider mb-1" htmlFor="admin-status-select">
                  Alur Tahapan Kerja Baru
                </label>
                <select
                  id="admin-status-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as SubmissionStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white text-slate-800 dark:bg-stone-850 dark:text-stone-100 focus:outline-none"
                >
                  <option value="DIAJUKAN">DIAJUKAN (Baru Masuk)</option>
                  <option value="VERIFIKASI_ADMIN">VERIFIKASI ADMINISTRASI</option>
                  <option value="SURVEY_TEKNIS">SURVEY TEKNIS / LAPANGAN</option>
                  <option value="PROSES_REKOMENDASI">PROSES REKOMENDASI KADIN</option>
                  <option value="SELESAI">SELESAI & TERBITKAN DOKUMEN</option>
                  <option value="DITOLAK">DITOLAK (Berkas Kurang/Salah)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider mb-1" htmlFor="admin-notes-text">
                  Catatan Tambahan Petugas (Akan Tampil di Lacak)
                </label>
                <textarea
                  id="admin-notes-text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Misal: Dokumen KTP kurang jelas atau Lokasi survey di jadwalkan hari selasa."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white text-slate-800 dark:bg-stone-850 dark:text-stone-100 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveStatusChange}
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition"
                >
                  Simpan Status
                </button>
                <button
                  onClick={() => setSelectedSubId(null)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-350 dark:bg-stone-800 dark:hover:bg-stone-700 font-bold rounded-lg text-xs transition text-slate-700 dark:text-stone-300"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50/25 dark:bg-stone-900 border border-indigo-200/40 p-5 rounded-2xl flex flex-col justify-center text-center text-slate-400 h-full min-h-[220px]">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-pulse" />
              <p className="text-xs font-bold text-slate-600 dark:text-stone-350 leading-tight">Pengendali Berkas Pintar</p>
              <p className="text-[10px] mt-1 max-w-xs mx-auto leading-relaxed">
                Pilih aksi <span className="font-bold text-amber-600">"Ubah"</span> pada daftar berkas warga untuk meningkatkan tahapan kelolanya. Tahapan baru akan segera tercermin langsung pada timeline pelacakan secara dinamis!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
