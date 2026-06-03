/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, Save, FileText, Check, AlertCircle, HelpCircle, Eye, Settings, Briefcase } from 'lucide-react';
import { ServiceTemplate, FieldDefinition, FieldType } from '../types';

interface FormCreatorProps {
  onSave: (newService: ServiceTemplate) => void;
  onSpeak: (text: string) => void;
}

export const FormCreator: React.FC<FormCreatorProps> = ({ onSave, onSpeak }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ServiceTemplate['category']>('Izin & Rekomendasi');
  const [icon, setIcon] = useState('FileText');
  const [fields, setFields] = useState<FieldDefinition[]>([
    { id: 'nama_pemohon', label: 'Nama Lengkap Pemohon', type: 'text', required: true, placeholder: 'Masukkan nama lengkap' },
    { id: 'kontak_pemohon', label: 'Nomor WhatsApp', type: 'text', required: true, placeholder: 'Contoh: 0812XXXXXXXX' }
  ]);

  // Current field states
  const [currentLabel, setCurrentLabel] = useState('');
  const [currentType, setCurrentType] = useState<FieldType>('text');
  const [currentRequired, setCurrentRequired] = useState(true);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [currentOptions, setCurrentOptions] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const iconsList = [
    { value: 'FileText', label: 'Dokumen' },
    { value: 'Droplet', label: 'Cairan/Air' },
    { value: 'Leaf', label: 'Daun/Tanaman' },
    { value: 'ShieldAlert', label: 'Perlindungan/Aduan' },
    { value: 'Flame', label: 'Energi/Asap' },
    { value: 'Settings', label: 'Konfigurasi' },
    { value: 'Briefcase', label: 'Perusahaan' }
  ];

  const addField = () => {
    if (!currentLabel.trim()) {
      setMessage({ type: 'error', text: 'Label field tidak boleh kosong!' });
      return;
    }

    const newFieldId = currentLabel.toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '_');

    // Check duplicate
    if (fields.some(f => f.id === newFieldId)) {
      setMessage({ type: 'error', text: 'Field dengan nama serupa sudah ada.' });
      return;
    }

    const fieldOptions = (currentType === 'select' || currentType === 'checkbox_group')
      ? currentOptions.split(',').map(o => o.trim()).filter(Boolean)
      : undefined;

    if ((currentType === 'select' || currentType === 'checkbox_group') && (!fieldOptions || fieldOptions.length === 0)) {
      setMessage({ type: 'error', text: 'Untuk tipe pilihan, Anda harus memasukkan minimal satu opsi pilihan (dipisah koma).' });
      return;
    }

    const newField: FieldDefinition = {
      id: newFieldId,
      label: currentLabel,
      type: currentType,
      required: currentRequired,
      placeholder: currentPlaceholder || undefined,
      options: fieldOptions
    };

    setFields([...fields, newField]);
    setCurrentLabel('');
    setCurrentPlaceholder('');
    setCurrentOptions('');
    setMessage(null);

    // Speak action
    onSpeak(`Field ${currentLabel} berhasil ditambahkan`);
  };

  const removeField = (index: number) => {
    const fieldName = fields[index].label;
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
    onSpeak(`Field ${fieldName} dihapus`);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Nama Formulir Permohonan wajib diisi!' });
      return;
    }
    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Deskripsi singkat wajib diisi!' });
      return;
    }
    if (fields.length === 0) {
      setMessage({ type: 'error', text: 'Atur minimal satu field agar berkas formulir dinamis aktif!' });
      return;
    }

    const templateId = 'custom-' + name.toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');

    const newService: ServiceTemplate = {
      id: templateId,
      name,
      description,
      category,
      icon,
      fields,
      isCustom: true
    };

    onSave(newService);
    setMessage({ type: 'success', text: `Formulir permohonan "${name}" berhasil dibuat dan ditambahkan ke beranda!` });

    // Reset Form
    setName('');
    setDescription('');
    setCategory('Izin & Rekomendasi');
    setIcon('FileText');
    setFields([
      { id: 'nama_pemohon', label: 'Nama Lengkap Pemohon', type: 'text', required: true, placeholder: 'Masukkan nama lengkap' },
      { id: 'kontak_pemohon', label: 'Nomor WhatsApp', type: 'text', required: true, placeholder: 'Contoh: 0812XXXXXXXX' }
    ]);

    onSpeak(`Formulir dinamis baru ${name} sukses disimpan! Formulir siap digunakan di beranda.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="form-creator-container">
      {/* Visual Form Builder Settings */}
      <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-emerald-100 dark:border-stone-800 p-6 rounded-2xl shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-stone-100 mb-2 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          Rancang Formulir Layanan Dinamis Baru
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Sistem Sobat Hijau memungkinkan pembuat keputusan meluncurkan perizinan atau pengumpulan data lingkungan secara kilat dengan variabel input dinamis.
        </p>

        {/* Global info */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-stone-300 mb-1" htmlFor="service-name">
                Nama Layanan/Permohonan <span className="text-red-500">*</span>
              </label>
              <input
                id="service-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Sewa Kontainer Sampah Pasar"
                className="w-full px-3 py-2 text-xs rounded-lg border border-emerald-100 dark:border-stone-700 bg-[#F9FBFA] focus:bg-white text-slate-800 dark:bg-stone-850 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-stone-300 mb-1" htmlFor="service-category">
                Kategori Layanan <span className="text-red-500">*</span>
              </label>
              <select
                id="service-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceTemplate['category'])}
                className="w-full px-3 py-2 text-xs rounded-lg border border-emerald-100 dark:border-stone-700 bg-[#F9FBFA] text-slate-800 dark:bg-stone-850 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
              >
                <option value="Izin & Rekomendasi">Izin & Rekomendasi</option>
                <option value="Laboratorium">Laboratorium (Pemeriksaan)</option>
                <option value="Kemitraan & Edukasi">Kemitraan & Edukasi</option>
                <option value="Layanan Umum">Layanan Umum / Pengaduan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-stone-300 mb-1" htmlFor="service-desc">
                Deskripsi Singkat Layanan <span className="text-red-500">*</span>
              </label>
              <input
                id="service-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Misal: Peminjaman tempat kontainer pembuangan sampah berbayar."
                className="w-full px-3 py-2 text-xs rounded-lg border border-emerald-100 dark:border-stone-700 bg-[#F9FBFA] focus:bg-white text-slate-800 dark:bg-stone-850 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-stone-300 mb-1" htmlFor="service-icon">
                Pilih Ikon Layanan <span className="text-red-500">*</span>
              </label>
              <select
                id="service-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-emerald-100 dark:border-stone-700 bg-[#F9FBFA] text-slate-800 dark:bg-stone-850 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
              >
                {iconsList.map(iconObj => (
                  <option key={iconObj.value} value={iconObj.value}>{iconObj.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Fields List */}
        <div className="border-t border-slate-100 dark:border-stone-800 pt-5 mb-6">
          <h4 className="text-xs font-bold text-emerald-950 dark:text-stone-200 mb-3 block">Field Dinamis Saat Ini</h4>
          
          <div className="space-y-2 mb-5">
            {fields.map((field, idx) => (
              <div 
                key={field.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-stone-850/60 border border-slate-100 dark:border-stone-800 text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-stone-200">
                    <span>{field.label}</span>
                    {field.required && <span className="text-red-500 text-[10px]">*</span>}
                    <span className="text-[9px] font-mono font-normal px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-stone-700 dark:text-emerald-300">
                      t:{field.type}
                    </span>
                  </div>
                  {field.placeholder && (
                    <p className="text-[10px] text-slate-400 mt-1">Hint: {field.placeholder}</p>
                  )}
                  {field.options && (
                    <p className="text-[10px] text-emerald-600 mt-0.5">Opsi: {field.options.join(', ')}</p>
                  )}
                </div>
                
                {/* Basic fields like name/phone shouldn't be deleted so we keep minimum core */}
                {idx > 1 ? (
                  <button
                    onClick={() => removeField(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition"
                    title="Hapus field ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[9px] text-slate-400 font-mono italic">Wajib Bawaan</span>
                )}
              </div>
            ))}
          </div>

          {/* Add field box */}
          <div className="bg-emerald-50/25 dark:bg-stone-850/30 p-4 rounded-xl border border-dashed border-emerald-200 dark:border-stone-850">
            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-400 mb-3 flex items-center gap-1">
              <Plus className="w-4 h-4" />
              <span>Tambah Input Variabel Form Baru ({name || 'Permohonan Baru'})</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-stone-400 mb-1" htmlFor="input-label">
                  Nama Label Pertanyaan/Input
                </label>
                <input
                  id="input-label"
                  type="text"
                  value={currentLabel}
                  onChange={(e) => setCurrentLabel(e.target.value)}
                  placeholder="Misal: Durasi Sewa Kontainer"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white text-slate-800 dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-stone-400 mb-1" htmlFor="input-type">
                  Pilih Tanda/Tipe Kolom
                </label>
                <select
                  id="input-type"
                  value={currentType}
                  onChange={(e) => setCurrentType(e.target.value as FieldType)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white text-slate-800 dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
                >
                  <option value="text">Teks Singkat (Text)</option>
                  <option value="number">Teks Angka (Number)</option>
                  <option value="date">Input Tanggal (Date)</option>
                  <option value="select">Pilihan Tunggal (Select Dropdown)</option>
                  <option value="textarea">Teks Deskripsi Panjang (Textarea)</option>
                  <option value="checkbox_group">Pilihan Banyak (Checkbox Group)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-stone-400 mb-1" htmlFor="input-placeholder">
                  Placeholder / Petunjuk Pengisian
                </label>
                <input
                  id="input-placeholder"
                  type="text"
                  value={currentPlaceholder}
                  onChange={(e) => setCurrentPlaceholder(e.target.value)}
                  placeholder="Misal: Isikan besaran dalam hari atau jam"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white text-slate-800 dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-stone-400 mb-1" htmlFor="input-req">
                  Apakah Kolom ini Harus Diisi?
                </label>
                <select
                  id="input-req"
                  value={currentRequired ? 'yes' : 'no'}
                  onChange={(e) => setCurrentRequired(e.target.value === 'yes')}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white text-slate-800 dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
                >
                  <option value="yes">Ya (Mandatory)</option>
                  <option value="no">Tidak (Optional)</option>
                </select>
              </div>
            </div>

            {/* Options only for Select and Checkbox */}
            {(currentType === 'select' || currentType === 'checkbox_group') && (
              <div className="mb-4">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400 mb-1" htmlFor="input-options">
                  Ketik Opsi Pilihan (Pisahkan dengan Tanda Koma) <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-options"
                  type="text"
                  value={currentOptions}
                  onChange={(e) => setCurrentOptions(e.target.value)}
                  placeholder="Contoh: Sampah Organik, Sampah Plastik, Sampah Kimia B3"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-stone-700 bg-white text-slate-800 dark:bg-stone-900 dark:text-amber-100 focus:outline-none"
                />
              </div>
            )}

            <button
              onClick={addField}
              className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
              id="btn-add-field"
            >
              <Plus className="w-3.5 h-3.5" />
              Masukkan Input ke Formulir
            </button>
          </div>
        </div>

        {/* Error / Success Message */}
        {message && (
          <div className={`p-3 rounded-lg flex items-center gap-2 mb-4 text-xs ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
          id="btn-save-custom-form"
        >
          <Save className="w-4 h-4" />
          <span>Terbitkan Layanan & Form Dinamis DLH</span>
        </button>
      </div>

      {/* Renders dynamic field preview side-by-side */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#F9FBFA] dark:bg-stone-950 p-6 rounded-2xl border border-emerald-100 dark:border-stone-850 flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-stone-800 pb-3 mb-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-500" />
              Pratinjau Formulir Berkas Pintar (Real-Time)
            </h4>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-stone-800 dark:text-stone-400 font-mono font-semibold">STABLE PREVIEW</span>
          </div>

          <div className="flex-1 bg-white dark:bg-stone-900 p-5 rounded-xl shadow-inner border border-slate-100 dark:border-stone-850">
            <div className="text-center pb-4 mb-4 border-b border-dashed border-slate-100 dark:border-stone-800">
              <span className="text-xs font-mono font-bold tracking-wider text-emerald-800 uppercase block dark:text-emerald-400">DINAS LINGKUNGAN HIDUP</span>
              <h2 className="text-sm font-black text-slate-900 mt-1 dark:text-white">{name || 'Nama Formulir Anda'}</h2>
              <p className="text-[10px] text-slate-400 mt-0.5 dark:text-stone-500 italic">{description || 'Tuliskan deskripsi formulir di samping untuk melihat pratinjau.'}</p>
            </div>

            {/* Mock fields */}
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              {fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-stone-300">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  
                  {field.type === 'text' && (
                    <input 
                      type="text" 
                      disabled
                      placeholder={field.placeholder || "Simulasi ketikan..."}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 dark:border-stone-800 dark:bg-stone-950 text-slate-400"
                    />
                  )}

                  {field.type === 'number' && (
                    <input 
                      type="number" 
                      disabled
                      placeholder={field.placeholder || "Menerima angka..."}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 dark:border-stone-800 dark:bg-stone-950 text-slate-400"
                    />
                  )}

                  {field.type === 'date' && (
                    <input 
                      type="date" 
                      disabled
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 dark:border-stone-800 dark:bg-stone-950 text-slate-400"
                    />
                  )}

                  {field.type === 'textarea' && (
                    <textarea 
                      disabled
                      placeholder={field.placeholder || "Simulasi paragraf..."}
                      rows={2}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 dark:border-stone-800 dark:bg-stone-950 text-slate-400 resize-none"
                    />
                  )}

                  {field.type === 'select' && (
                    <select disabled className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 dark:border-stone-800 dark:bg-stone-950 text-slate-400">
                      <option>-- Pilih Salah Satu --</option>
                      {field.options?.map((opt, oIdx) => (
                        <option key={oIdx}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'checkbox_group' && (
                    <div className="space-y-1 bg-slate-50 dark:bg-stone-950 p-2 rounded-lg border border-slate-100 dark:border-stone-850">
                      {field.options?.map((opt, oIdx) => (
                        <label key={oIdx} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-stone-400">
                          <input type="checkbox" disabled className="rounded border-slate-300" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-4 flex justify-end">
                <button disabled className="px-4 py-2 bg-slate-200 text-slate-400 text-xs rounded-lg cursor-not-allowed">
                  Kirim Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
