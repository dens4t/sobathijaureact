import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity } from 'lucide-react';
import { useStore } from './store/useStore';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import { LayananKami } from './components/LayananKami';
import { TrackingSobat } from './components/TrackingSobat';
import { AsistenHijau } from './components/AsistenHijau';
import { PublicHeader } from './layouts/PublicHeader';
import { PublicFooter } from './layouts/PublicFooter';
import { AdminLayout } from './layouts/AdminLayout';

// Lazy load heavy components
const EcoCarousel = React.lazy(() => import('./components/EcoCarousel').then(m => ({ default: m.EcoCarousel })));
const EnvironmentalMap = React.lazy(() => import('./components/EnvironmentalMap').then(m => ({ default: m.EnvironmentalMap })));

export default function App() {
  const { 
    initStore, isInitialized, services, submissions, 
    addSubmission, adminActivityLogs, refreshActivityLogs 
  } = useStore();

  const [portal, setPortal] = useState<'guest' | 'admin'>('guest');
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [adminSubTab, setAdminSubTab] = useState<'kelola' | 'rancang' | 'layanan'>('kelola');
  const [trackSearchCode, setTrackSearchCode] = useState<string>('');
  const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState(false);
  
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);
  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const goAdmin = (sub: 'kelola' | 'rancang' | 'layanan') => { window.location.hash = `#/admin/${sub}`; };
  const goGuest = (tab: string) => { window.location.hash = `#/${tab}`; };

  useEffect(() => {
    initStore().catch(() => addToast('Server SQLite tidak aktif. Mode data contoh lokal dipakai.', 'info'));
  }, [initStore]);

  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace('#/', '').split('/');
      const page = hash[0] || 'beranda';
      const sub = hash[1] || '';
      if (page === 'admin') {
        setPortal('admin');
        if (sub === 'rancang' || sub === 'kelola' || sub === 'layanan') setAdminSubTab(sub as any);
        else setAdminSubTab('kelola');
      } else {
        setPortal('guest');
        setActiveTab(page || 'beranda');
      }
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  const speakText = (text: string) => {
    const tts = useStore.getState().accessibility.textToSpeech;
    if (tts && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const changeTab = (tabName: string) => {
    goGuest(tabName);
    let tabIndo = "";
    if (tabName === 'beranda') tabIndo = "Beranda Utama";
    else if (tabName === 'layanan') tabIndo = "Formulir Layanan Kami";
    else if (tabName === 'lacak') tabIndo = "Lacak Berkas Permohonan";
    else if (tabName === 'asisten') tabIndo = "Chat Asisten Cerdas";
    speakText(`Membuka tab ${tabIndo}`);
  };

  const routeToTracking = (code: string) => {
    setTrackSearchCode(code);
    goGuest('lacak');
    addToast(`Melacak kemajuan berkas dengan kode: ${code}`, 'info');
  };

  if (!isInitialized) return <div className="min-h-screen flex items-center justify-center bg-stone-50">Loading...</div>;

  return (
    <div className={portal === 'admin' ? "min-h-screen bg-stone-100 dark:bg-stone-950 flex transition-colors duration-300 relative text-[#081C15] dark:text-stone-100" : "min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col transition-colors duration-300 relative text-[#081C15] dark:text-stone-100"}>
      
      {/* Toasts */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-[11px] font-bold tracking-wide flex items-start gap-4 justify-between animate-fade-in backdrop-blur-md ${toast.type === 'success' ? 'bg-[#E5F5EB]/95 text-[#1B4332] border-emerald-200' : toast.type === 'error' ? 'bg-rose-50/95 text-rose-950 border-rose-200' : 'bg-indigo-50/95 text-indigo-950 border-indigo-200'}`}>
            <div className="flex-1 text-left">{toast.message}</div>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-slate-400 hover:text-slate-600 transition cursor-pointer self-start mt-0.5"><X className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>

      <AccessibilityWidget settings={useStore.getState().accessibility} onChange={useStore.getState().updateAccessibility} />

      {/* Admin Activity Modal */}
      <AnimatePresence>
        {isActivityLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsActivityLogModalOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 15, opacity: 0 }} className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200/60 w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[85vh]">
              <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-emerald-950/20 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-650"><Activity className="w-5 h-5 animate-pulse" /></div>
                  <div><h3 className="text-sm font-extrabold uppercase">Catatan Log Aktivitas Admin</h3><p className="text-[10px] text-stone-400 font-mono">SOBATHIJAU SECURITY AUDIT</p></div>
                </div>
                <button onClick={() => setIsActivityLogModalOpen(false)} className="p-1.5 rounded-xl hover:bg-stone-100 transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-[11px] text-amber-800 flex items-start gap-2.5">
                  <span className="text-amber-500 text-sm mt-0.5 leading-none">⚠️</span>
                  <div><span className="font-bold">Keamanan & Audit:</span> Aktivitas ini direkam dalam sistem audit log terpusat DLH Pontianak.</div>
                </div>
                <div className="space-y-3">
                  {adminActivityLogs.map(log => (
                    <div key={log.id} className="p-3.5 rounded-2xl border bg-stone-50/50 flex items-start gap-3">
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${log.iconType === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400'}`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-semibold">{log.action}</p>
                        <p className="text-[9px] text-stone-400 font-mono">{log.timestamp} WIB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-stone-50 border-t flex items-center justify-between text-[11px]">
                <span className="text-stone-400 font-mono text-[9px]">TOTAL LOGS: {adminActivityLogs.length} REC</span>
                <button onClick={() => { refreshActivityLogs(); addToast('Log aktivitas diperbarui.', 'info'); }} className="text-stone-500 hover:text-emerald-500 font-bold transition">Segarkan Log</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {portal === 'admin' ? (
        <AdminLayout adminSubTab={adminSubTab} goAdmin={goAdmin} goGuest={goGuest} speakText={speakText} routeToTracking={routeToTracking} addToast={addToast} />
      ) : (
        <div className="flex flex-col flex-1 w-full">
          <PublicHeader activeTab={activeTab} changeTab={changeTab} goAdmin={goAdmin} speakText={speakText} setTrackSearchCode={setTrackSearchCode} addToast={addToast} />

          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full transition-colors duration-300">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                
                {activeTab === 'beranda' && (
                  <div className="space-y-8 animate-fade-in">
                    {/* Hero Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center bg-white border p-6 md:p-8 rounded-2xl shadow-sm text-left">
                      <div className="xl:col-span-7 space-y-4">
                        <h2 className="text-xl md:text-3xl font-bold text-[#1B4332] leading-tight">Pelayanan Responsif, <br /><span className="text-[#2D6A4F]">Bebas Hambatan & Terbuka</span> Untuk Semua</h2>
                        <p className="text-xs text-slate-500 leading-relaxed">Sobat Hijau adalah portal pelayanan publik Dinas Lingkungan Hidup Kabupaten/Kota Pontianak. Didesain secara khusus untuk memenuhi standar kegunaan tertinggi demi melayani pengurusan SPPL mikro, pengaduan lingkungan hidup, serta permintaan bibit tanaman penghijauan dengan andal dan transparan.</p>
                        <div className="flex flex-wrap gap-2 pt-3">
                          <button onClick={() => changeTab('layanan')} className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-xl text-xs transition">Ajukan Permohonan Baru</button>
                          <button onClick={() => changeTab('lacak')} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-[#1B4332] font-bold rounded-xl text-xs border transition">Lacak Kemajuan Berkas</button>
                        </div>
                      </div>
                      <div className="lg:col-span-12 xl:col-span-5 relative w-full space-y-4">
                        <div className="bg-emerald-50 rounded-2xl border p-5 flex flex-col justify-between text-left shadow-sm">
                          <h3 className="text-[10px] font-extrabold text-slate-500 uppercase">INDEKS KUALITAS LINGKUNGAN HIDUP KOTA PONTIANAK</h3>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl md:text-4xl font-black text-[#1B4332] font-mono">65.69</span>
                            <span className="text-[9px] font-bold text-emerald-800 bg-[#E5F5EB] px-2 py-0.5 rounded-full font-mono">CUKUP BAIK</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Suspense fallback={<div className="h-64 bg-slate-50 animate-pulse rounded-2xl"></div>}>
                      <EcoCarousel />
                    </Suspense>

                    <Suspense fallback={<div className="h-64 bg-slate-50 animate-pulse rounded-2xl"></div>}>
                      <EnvironmentalMap />
                    </Suspense>
                  </div>
                )}

                {activeTab === 'layanan' && (
                  <div className="space-y-4 animate-fade-in text-slate-900">
                    <h3 className="text-lg font-black tracking-tight text-[#1B4332]">Daftar Layanan Publik DLH</h3>
                    <LayananKami 
                      services={services} 
                      onSubmitForm={async (svc, data) => {
                        try {
                          const dateNowStr = nowSql();
                          const newSubmission = {
                            id: data.__code, serviceId: svc.id, serviceName: svc.name,
                            submittedAt: dateNowStr, status: 'DIAJUKAN' as const, applicantName: data.__applicantName,
                            formData: Object.fromEntries(Object.entries(data).filter(([k]) => !k.startsWith('__'))),
                            timeline: createTimeline(dateNowStr)
                          };
                          await addSubmission(newSubmission);
                          addToast(`Permohonan ${svc.name} diajukan! Kode: ${data.__code}`, 'success');
                        } catch (e) {
                          addToast('Tersimpan lokal; server offline.', 'info');
                        }
                      }}
                      onSpeak={speakText}
                    />
                  </div>
                )}

                {activeTab === 'lacak' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-black tracking-tight text-[#1B4332]">Pelacakan Berkas Digital</h3>
                    <TrackingSobat submissions={submissions} initialSearchCode={trackSearchCode} onSpeak={speakText} />
                  </div>
                )}

                {activeTab === 'asisten' && (
                  <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
                    <h3 className="text-lg font-black tracking-tight text-[#1B4332]">Konsultasi Terpadu Cerdas</h3>
                    <AsistenHijau ttsEnabled={useStore.getState().accessibility.textToSpeech} onSpeak={speakText} />
                  </div>
                )}
                
              </motion.div>
            </AnimatePresence>
          </main>

          <PublicFooter changeTab={changeTab} />
        </div>
      )}
    </div>
  );
}