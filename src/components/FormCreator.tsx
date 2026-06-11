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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="form-creator-container">
      <div className="lg:col-span-6 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 p-6 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-stone-100 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          Rancang Formulir Layanan Dinamis
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-stone-300 mb-1">Nama Layanan *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none focus:border-emerald-500" placeholder="Misal: Izin Usaha Mikro" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-stone-300 mb-1">Kategori *</label>
              <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none focus:border-emerald-500">
                <option value="Izin & Rekomendasi">Izin & Rekomendasi</option>
                <option value="Laboratorium">Laboratorium</option>
                <option value="Kemitraan & Edukasi">Kemitraan & Edukasi</option>
                <option value="Layanan Umum">Layanan Umum</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-stone-300 mb-1">Ikon *</label>
              <select value={icon} onChange={e => setIcon(e.target.value)} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none focus:border-emerald-500">
                {iconsList.map(ic => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-stone-300 mb-1">Deskripsi *</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none focus:border-emerald-500" placeholder="Deskripsi singkat..." />
          </div>
        </div>

        <div className="mb-6 space-y-2 border-t border-slate-100 dark:border-stone-800 pt-4">
          <h4 className="text-xs font-bold text-slate-700 dark:text-stone-200 mb-3">Field yang Ditetapkan ({fields.length})</h4>
          {fields.map((f, i) => (
            <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-stone-850 border border-slate-100 dark:border-stone-800 text-xs">
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-stone-200">
                  <span>{f.label}</span>{f.required && <span className="text-rose-500">*</span>}
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-stone-800 dark:text-emerald-400 font-mono">{f.type}</span>
                </div>
              </div>
              {i > 1 ? (
                <button onClick={() => removeField(i)} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button>
              ) : (
                <span className="text-[9px] text-slate-400 font-mono">Bawaan</span>
              )}
            </div>
          ))}
        </div>

        <div className="bg-slate-50 dark:bg-stone-850 p-4 rounded-xl border border-dashed border-slate-300 dark:border-stone-700 mb-6">
          <p className="text-xs font-bold text-slate-700 dark:text-stone-300 mb-3 flex items-center gap-1"><Plus className="w-4 h-4" /> Tambah Field</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Label</label>
              <input value={currentLabel} onChange={e => setCurrentLabel(e.target.value)} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-emerald-500" placeholder="Misal: Alamat" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipe</label>
              <select value={currentType} onChange={e => setCurrentType(e.target.value as any)} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none">
                <option value="text">Teks Singkat</option>
                <option value="number">Angka</option>
                <option value="date">Tanggal</option>
                <option value="select">Dropdown Select</option>
                <option value="textarea">Teks Panjang</option>
                <option value="checkbox_group">Checkbox Banyak</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Wajib?</label>
              <select value={currentRequired ? 'yes' : 'no'} onChange={e => setCurrentRequired(e.target.value === 'yes')} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none">
                <option value="yes">Ya (Wajib)</option>
                <option value="no">Tidak</option>
              </select>
            </div>
          </div>
          {(currentType === 'select' || currentType === 'checkbox_group') && (
            <div className="mb-3">
              <label className="block text-[10px] font-bold text-amber-500 uppercase mb-1">Opsi (Pisah Koma) *</label>
              <input value={currentOptions} onChange={e => setCurrentOptions(e.target.value)} className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-amber-50/30 focus:outline-none focus:border-amber-500" placeholder="Opsi A, Opsi B" />
            </div>
          )}
          <button onClick={addField} className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Tambah Input</button>
        </div>

        {message && <div className={`p-3 rounded-lg flex items-center gap-2 mb-4 text-xs ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-rose-50 text-rose-800'}`}><AlertCircle className="w-4 h-4" />{message.text}</div>}

        <button onClick={handleSave} className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition flex justify-center items-center gap-2 shadow-sm"><Save className="w-4 h-4" /> Terbitkan Layanan</button>
      </div>

      <div className="lg:col-span-6 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-850 rounded-2xl p-6 relative h-fit shadow-inner">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Eye className="w-4 h-4" /> Pratinjau Tampilan Warga</h4>
        <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-slate-100 dark:border-stone-800 shadow-sm pointer-events-none opacity-90">
          <div className="text-center mb-5 pb-4 border-b border-dashed border-slate-200 dark:border-stone-800">
            <h2 className="text-sm font-black text-slate-800 dark:text-stone-100">{name || 'Nama Formulir Layanan'}</h2>
            <p className="text-[10px] text-slate-400 mt-1 italic">{description || 'Tuliskan deskripsi untuk pratinjau...'}</p>
          </div>
          <form className="space-y-4">
            {fields.map(f => (
              <div key={f.id}>
                <label className="block text-xs font-semibold text-slate-600 dark:text-stone-300 mb-1">{f.label} {f.required && <span className="text-rose-500">*</span>}</label>
                {f.type === 'textarea' ? (
                  <textarea rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-800 bg-slate-50 dark:bg-stone-950 text-xs text-slate-400" placeholder={f.placeholder || '...'} />
                ) : f.type === 'select' ? (
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-800 bg-slate-50 dark:bg-stone-950 text-xs text-slate-400"><option>-- Pilih --</option></select>
                ) : f.type === 'checkbox_group' ? (
                  <div className="space-y-1 p-2 rounded-lg bg-slate-50 dark:bg-stone-950 border border-slate-100 dark:border-stone-800">
                    {f.options?.map((o, idx) => <label key={idx} className="flex gap-2 text-xs text-slate-500 items-center"><input type="checkbox" className="rounded" />{o}</label>)}
                  </div>
                ) : (
                  <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-stone-800 bg-slate-50 dark:bg-stone-950 text-xs text-slate-400" placeholder={f.placeholder || '...'} />
                )}
              </div>
            ))}
            <div className="pt-4 flex justify-end"><button className="px-5 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg opacity-50">Kirim</button></div>
          </form>
        </div>
      </div>
    </div>
  );
};
