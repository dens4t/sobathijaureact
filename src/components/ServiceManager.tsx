/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pencil, Trash2, Save, X, Package, AlertCircle, Plus, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { ServiceTemplate, FieldDefinition, FieldType } from '../types';

interface ServiceManagerProps {
  services: ServiceTemplate[];
  onUpdate: (updated: ServiceTemplate) => void;
  onDelete: (id: string) => void;
  onSpeak: (text: string) => void;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Teks Singkat' },
  { value: 'number', label: 'Angka' },
  { value: 'date', label: 'Tanggal' },
  { value: 'textarea', label: 'Teks Panjang' },
  { value: 'select', label: 'Pilihan Tunggal (Select)' },
  { value: 'checkbox_group', label: 'Pilihan Banyak (Checkbox)' },
];

const CATEGORIES: ServiceTemplate['category'][] = [
  'Izin & Rekomendasi', 'Laboratorium', 'Kemitraan & Edukasi', 'Layanan Umum'
];

const ICONS = ['FileText','Droplet','Leaf','ShieldAlert','Flame','Settings','Briefcase'];

interface EditState {
  name: string;
  description: string;
  category: ServiceTemplate['category'];
  icon: string;
  fields: FieldDefinition[];
}

const emptyField = (): Omit<FieldDefinition,'id'> & { _label: string; _options: string } => ({
  _label: '', label: '', type: 'text', required: true, placeholder: '', _options: ''
});

export const ServiceManager: React.FC<ServiceManagerProps> = ({ services, onUpdate, onDelete, onSpeak }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [newField, setNewField] = useState(emptyField());
  const [fieldErr, setFieldErr] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const startEdit = (s: ServiceTemplate) => {
    setEditingId(s.id);
    setEdit({ name: s.name, description: s.description, category: s.category, icon: s.icon, fields: s.fields.map(f => ({ ...f })) });
    setNewField(emptyField());
    setFieldErr('');
    setMsg(null);
    onSpeak(`Mengedit layanan ${s.name}`);
  };

  const cancelEdit = () => { setEditingId(null); setEdit(null); setMsg(null); };

  const saveEdit = () => {
    if (!edit) return;
    if (!edit.name.trim() || !edit.description.trim()) {
      setMsg({ type: 'error', text: 'Nama dan deskripsi wajib diisi.' }); return;
    }
    const svc = services.find(s => s.id === editingId);
    if (!svc) return;
    onUpdate({ ...svc, name: edit.name.trim(), description: edit.description.trim(), category: edit.category, icon: edit.icon, fields: edit.fields });
    setMsg({ type: 'success', text: `Layanan "${edit.name}" berhasil diperbarui.` });
    setEditingId(null); setEdit(null);
    onSpeak(`Layanan ${edit.name} diperbarui`);
  };

  const updateField = (idx: number, patch: Partial<FieldDefinition>) =>
    setEdit(e => e ? { ...e, fields: e.fields.map((f, i) => i === idx ? { ...f, ...patch } : f) } : e);

  const removeField = (idx: number) =>
    setEdit(e => e ? { ...e, fields: e.fields.filter((_, i) => i !== idx) } : e);

  const moveField = (idx: number, dir: -1 | 1) => {
    if (!edit) return;
    const arr = [...edit.fields];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setEdit({ ...edit, fields: arr });
  };

  const addNewField = () => {
    if (!edit) return;
    if (!newField._label.trim()) { setFieldErr('Label field wajib diisi.'); return; }
    const id = newField._label.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '_');
    if (edit.fields.some(f => f.id === id)) { setFieldErr('Field dengan nama serupa sudah ada.'); return; }
    const needsOpts = newField.type === 'select' || newField.type === 'checkbox_group';
    const opts = newField._options.split(',').map(o => o.trim()).filter(Boolean);
    if (needsOpts && opts.length === 0) { setFieldErr('Tipe ini butuh minimal satu opsi (pisahkan koma).'); return; }
    const field: FieldDefinition = {
      id, label: newField._label.trim(), type: newField.type, required: newField.required,
      placeholder: newField.placeholder || undefined, options: needsOpts ? opts : undefined
    };
    setEdit({ ...edit, fields: [...edit.fields, field] });
    setNewField(emptyField()); setFieldErr('');
  };

  const handleDelete = (s: ServiceTemplate) => {
    if (!window.confirm(`Hapus layanan "${s.name}"? Formulir ini tidak bisa diajukan lagi.`)) return;
    onDelete(s.id); onSpeak(`Layanan ${s.name} dihapus`);
  };

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`p-3 rounded-lg flex items-center gap-2 text-xs ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          <AlertCircle className="w-4 h-4 shrink-0" />{msg.text}
        </div>
      )}

      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-slate-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-stone-800 flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Kelola Layanan</h4>
          <span className="ml-auto text-[10px] font-mono text-slate-400">{services.length} layanan</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-stone-850">
          {services.map(svc => (
            <div key={svc.id} className="px-6 py-5">
              {editingId === svc.id && edit ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Layanan</label>
                      <input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kategori</label>
                      <select value={edit.category} onChange={e => setEdit({ ...edit, category: e.target.value as ServiceTemplate['category'] })} className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none focus:border-emerald-500">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deskripsi</label>
                      <input value={edit.description} onChange={e => setEdit({ ...edit, description: e.target.value })} className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ikon Layanan</label>
                      <select value={edit.icon} onChange={e => setEdit({ ...edit, icon: e.target.value })} className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none focus:border-emerald-500">
                        {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><GripVertical className="w-3 h-3" /> Field Formulir ({edit.fields.length})</h5>
                    <div className="space-y-2 mb-4">
                      {edit.fields.map((f, idx) => (
                        <div key={f.id} className="bg-white dark:bg-stone-900 rounded-xl border border-slate-200 dark:border-stone-700 p-3 space-y-2 shadow-sm">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="sm:col-span-2">
                              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Label</label>
                              <input value={f.label} onChange={e => updateField(idx, { label: e.target.value })} className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Tipe</label>
                              <select value={f.type} onChange={e => updateField(idx, { type: e.target.value as FieldType })} className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none">
                                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Wajib?</label>
                              <select value={f.required ? 'ya' : 'tidak'} onChange={e => updateField(idx, { required: e.target.value === 'ya' })} className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none">
                                <option value="ya">Ya</option>
                                <option value="tidak">Tidak</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Placeholder</label>
                              <input value={f.placeholder || ''} onChange={e => updateField(idx, { placeholder: e.target.value || undefined })} className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-850 focus:outline-none" />
                            </div>
                            {(f.type === 'select' || f.type === 'checkbox_group') && (
                              <div>
                                <label className="block text-[9px] font-bold text-amber-500 uppercase mb-0.5">Opsi (pisah koma)</label>
                                <input value={f.options?.join(', ') || ''} onChange={e => updateField(idx, { options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })} className="w-full px-2 py-1 text-xs rounded-lg border border-amber-200 dark:border-stone-700 bg-amber-50/50 dark:bg-stone-850 focus:outline-none" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-stone-800">
                            <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                            <button onClick={() => moveField(idx, 1)} disabled={idx === edit.fields.length - 1} className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                            <span className="text-[9px] font-mono text-slate-400 ml-1">ID: {f.id}</span>
                            <button onClick={() => removeField(idx)} className="ml-auto p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-stone-800"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 dark:bg-stone-850 border border-dashed border-slate-200 dark:border-stone-700 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-bold text-slate-600 dark:text-stone-300 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Tambah Field</p>
                      {fieldErr && <p className="text-[10px] text-rose-600 font-medium">{fieldErr}</p>}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Label *</label>
                          <input value={newField._label} onChange={e => setNewField({ ...newField, _label: e.target.value })} className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Tipe</label>
                          <select value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value as FieldType })} className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none">
                            {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Wajib?</label>
                          <select value={newField.required ? 'ya' : 'tidak'} onChange={e => setNewField({ ...newField, required: e.target.value === 'ya' })} className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none">
                            <option value="ya">Ya</option>
                            <option value="tidak">Tidak</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Placeholder</label>
                          <input value={newField.placeholder} onChange={e => setNewField({ ...newField, placeholder: e.target.value })} className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none" />
                        </div>
                        {(newField.type === 'select' || newField.type === 'checkbox_group') && (
                          <div>
                            <label className="block text-[9px] font-bold text-amber-500 uppercase mb-0.5">Opsi (pisah koma) *</label>
                            <input value={newField._options} onChange={e => setNewField({ ...newField, _options: e.target.value })} className="w-full px-2 py-1 text-xs rounded-lg border border-amber-300 dark:border-stone-700 bg-amber-50/50 dark:bg-stone-900 focus:outline-none" />
                          </div>
                        )}
                      </div>
                      <button onClick={addNewField} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white text-xs font-bold rounded-lg transition">Tambah Field</button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-stone-800">
                    <button onClick={saveEdit} className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition">Simpan Perubahan</button>
                    <button onClick={cancelEdit} className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-100 dark:bg-stone-800 hover:bg-slate-200 text-slate-700 dark:text-stone-300 text-xs font-bold rounded-xl transition">Batal</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-bold text-slate-800 dark:text-stone-100">{svc.name}</h5>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400">{svc.category}</span>
                      {svc.isCustom && <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">CUSTOM</span>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-stone-400 line-clamp-2">{svc.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {svc.fields.map(f => (
                        <span key={f.id} className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-200 dark:border-stone-700 text-slate-500 dark:text-stone-400">{f.label}{f.required ? '*' : ''}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(svc)} className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-stone-800 text-slate-600 hover:text-emerald-700 transition" title="Edit"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(svc)} className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-stone-800 text-slate-600 hover:text-rose-600 transition" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
