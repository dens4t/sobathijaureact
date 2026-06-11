import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Activity, Plus, ChevronDown, ChevronUp, FolderOpen, FolderSync, Settings, LogOut, HelpCircle, X } from 'lucide-react';
import { useStore } from '../store/useStore';

interface AdminSidebarProps {
  adminSubTab: 'kelola' | 'rancang' | 'layanan';
  goAdmin: (sub: 'kelola' | 'rancang' | 'layanan') => void;
  goGuest: (tab: string) => void;
  speakText: (text: string) => void;
  isAdminSidebarOpen: boolean;
  setIsAdminSidebarOpen: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ adminSubTab, goAdmin, goGuest, speakText, isAdminSidebarOpen, setIsAdminSidebarOpen }) => {
  const { submissions, refreshActivityLogs } = useStore();
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [isMenuUtamaOpen, setIsMenuUtamaOpen] = useState(true);
  const [isPortalPublikOpen, setIsPortalPublikOpen] = useState(true);
  const adminSidebarNavRef = useRef<HTMLElement | null>(null);
  const sidebarSearchInputRef = useRef<HTMLInputElement | null>(null);

  const showKelolaBerkas = "Kelola Berkas Masuk".toLowerCase().includes(sidebarSearchQuery.toLowerCase());
  const showRancangLayanan = "Rancang Layanan Baru".toLowerCase().includes(sidebarSearchQuery.toLowerCase());
  const showKelolalLayanan = "Kelola Semua Layanan".toLowerCase().includes(sidebarSearchQuery.toLowerCase());
  const showKembaliWebsite = "Kembali ke Website".toLowerCase().includes(sidebarSearchQuery.toLowerCase());

  const pendingCount = submissions.filter(s => s.status === 'DIAJUKAN' || s.status === 'VERIFIKASI_ADMIN').length;

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAdminSidebarOpen(true);
        setTimeout(() => sidebarSearchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [setIsAdminSidebarOpen]);

  return (
    <aside className={`fixed md:sticky top-0 bottom-0 left-0 z-50 h-screen w-64 bg-[#081C15] text-stone-100 flex flex-col shrink-0 border-r border-[#1B4332]/40 transition duration-300 md:translate-x-0 ${isAdminSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl md:shadow-none`}>
      <div className="p-5 border-b border-[#1B4332]/30 flex flex-col items-center text-center gap-2 relative shrink-0">
        <button onClick={() => setIsAdminSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white bg-white/10 md:hidden"><X className="w-4 h-4" /></button>
        <div className="w-12 h-12 rounded-full bg-emerald-900/50 flex items-center justify-center mb-1">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/02/Seal_of_Pontianak.svg" alt="Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
        </div>
        <h2 className="text-sm font-bold tracking-tight text-emerald-400">SobatHijau <span className="text-white font-normal">DLH</span></h2>
        <p className="text-[9px] text-stone-400 uppercase font-mono tracking-widest">Admin Portal</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 space-y-4">
        <div className="relative font-sans">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2D6A4F]" />
          <input ref={sidebarSearchInputRef} type="text" className="w-full bg-[#05130E]/90 border border-[#1B4332]/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition-all font-medium" placeholder="Cari Menu... (Ctrl+K)" value={sidebarSearchQuery} onChange={(e) => setSidebarSearchQuery(e.target.value)} />
        </div>

        {!sidebarSearchQuery && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { goAdmin('rancang'); setIsAdminSidebarOpen(false); }} className="flex flex-col items-center p-2 rounded-xl bg-gradient-to-b from-[#113124]/90 to-[#0A1F16]/95 border border-[#1B4332]/60 hover:border-emerald-500/50 hover:text-emerald-400 transition-all text-center gap-1">
              <Plus className="w-4 h-4" /><span className="text-[9px] font-bold">Buat Berkas</span>
            </button>
            <button onClick={refreshActivityLogs} className="flex flex-col items-center p-2 rounded-xl bg-gradient-to-b from-[#113124]/90 to-[#0A1F16]/95 border border-[#1B4332]/60 hover:border-emerald-500/50 hover:text-emerald-400 transition-all text-center gap-1">
              <Activity className="w-4 h-4" /><span className="text-[9px] font-bold">Log Aktivitas</span>
            </button>
          </div>
        )}

        {(showKelolaBerkas || showRancangLayanan || showKelolalLayanan) && (
          <div className="space-y-1 mt-4">
            <p className="text-[9px] text-[#2D6A4F] font-bold uppercase tracking-widest px-2 mb-2">Menu Utama</p>
            {showKelolaBerkas && <SidebarItem active={adminSubTab === 'kelola'} onClick={() => { goAdmin('kelola'); setIsAdminSidebarOpen(false); }} icon={<FolderOpen className="w-4 h-4" />} label="Berkas Masuk" badge={pendingCount > 0 ? pendingCount : undefined} />}
            {showKelolalLayanan && <SidebarItem active={adminSubTab === 'layanan'} onClick={() => { goAdmin('layanan'); setIsAdminSidebarOpen(false); }} icon={<FolderSync className="w-4 h-4" />} label="Semua Layanan" />}
            {showRancangLayanan && <SidebarItem active={adminSubTab === 'rancang'} onClick={() => { goAdmin('rancang'); setIsAdminSidebarOpen(false); }} icon={<Settings className="w-4 h-4" />} label="Rancang Layanan" />}
          </div>
        )}

        {showKembaliWebsite && (
          <div className="space-y-1 mt-6">
            <p className="text-[9px] text-[#2D6A4F] font-bold uppercase tracking-widest px-2 mb-2">Portal Publik</p>
            <button onClick={() => { goGuest('beranda'); setIsAdminSidebarOpen(false); }} className="w-full px-3 py-2.5 transition-all flex items-center gap-2.5 text-left rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40">
              <LogOut className="w-4 h-4 shrink-0" /><span className="truncate">Kembali ke Website</span>
            </button>
          </div>
        )}

        {(!showKelolaBerkas && !showRancangLayanan && !showKelolalLayanan && !showKembaliWebsite) && (
          <div className="py-8 text-center text-stone-500 text-xs">
            <HelpCircle className="w-6 h-6 text-stone-600 mx-auto mb-2 opacity-60" />
            <p>Tidak ditemukan</p>
          </div>
        )}
      </div>
    </aside>
  );
};

const SidebarItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }> = ({ active, onClick, icon, label, badge }) => (
  <button type="button" onClick={onClick} className={`w-full px-3 py-2.5 transition-all hover:scale-105 active:scale-95 flex items-center justify-between text-left border-l-4 text-xs ${active ? 'bg-gradient-to-r from-[#1B4332] via-[#113C2B] to-[#0D2E21] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)] border-l-emerald-400 pl-2 rounded-r-xl rounded-l-none font-bold' : 'text-stone-300 hover:bg-gradient-to-r hover:from-[#113C2B]/85 hover:to-[#0D2E21]/40 hover:text-white border-l-transparent hover:border-l-emerald-500/60 pl-2 rounded-xl font-bold hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_2px_4px_rgba(0,0,0,0.25)]'}`}>
    <div className="flex items-center gap-2.5 min-w-0">{icon}<span className="truncate">{label}</span></div>
    {badge !== undefined && <span className="bg-amber-500 text-[#081C15] text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse shadow-sm shrink-0">{badge}</span>}
  </button>
);