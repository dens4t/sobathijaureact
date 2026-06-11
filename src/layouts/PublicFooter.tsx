import React from 'react';

export const PublicFooter: React.FC<{ changeTab: (tab: string) => void }> = ({ changeTab }) => {
  return (
    <footer className="bg-white dark:bg-stone-900 border-t border-emerald-100 dark:border-stone-800 py-6 px-8 mt-12 transition-colors duration-300 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-[#1B4332] dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F]"></span>
            <span className="font-bold tracking-wide">Sobat Hijau DLH Kota Pontianak</span>
          </div>
          <p className="text-gray-400 dark:text-stone-500 max-w-sm leading-relaxed text-[11px]">
            Inovasi sistem perizinan mandiri & pengawasan lingkungan berkelanjutan. Terinspirasi dari portal Dinas Lingkungan Hidup Kota Pontianak.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 text-[11px] text-gray-500">
          <a href="#about" onClick={(e) => { e.preventDefault(); changeTab('beranda'); }} className="hover:text-[#1B4332] dark:hover:text-emerald-400 font-semibold transition">Hubungi Pengawas</a>
          <span className="text-slate-200 hidden sm:inline">|</span>
          <a href="#about" onClick={(e) => { e.preventDefault(); changeTab('asisten'); }} className="hover:text-[#1B4332] dark:hover:text-emerald-400 font-semibold transition">Edukasi UU Lingkungan</a>
          <span className="text-slate-200 hidden sm:inline">|</span>
          <p className="text-gray-400 dark:text-stone-500">© 2026 Dinas Lingkungan Hidup. Semua Hak Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};