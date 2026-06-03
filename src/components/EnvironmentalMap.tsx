import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MapPin, Info, Sparkles, Shield, Activity, HelpCircle } from 'lucide-react';

interface Subdistrict {
  id: string;
  name: string;
  pathData: string; // Precompiled beautiful custom SVG path data for Pontianak subdistricts
  colorClass: string;
  darkColorClass: string;
  permitsCount: number;
  qualityIndex: number; // IKLH index
  dominantSector: string;
}

interface EnvironmentalObject {
  id: string;
  name: string;
  subdistrict: string;
  type: 'AMDAL' | 'UKL-UPL' | 'SPPL';
  status: 'AKTIF' | 'PENGAWASAN' | 'UJI_KLIK';
  latitude: number;
  longitude: number;
  desc: string;
}

// Custom mock coordinates for Pontianak districts (represented as a 400x300 viewport grid)
const SUBDISTRICTS_DATA: Subdistrict[] = [
  {
    id: 'ptk-utara',
    name: 'Pontianak Utara',
    pathData: 'M 30,30 L 170,30 L 220,100 L 150,140 L 30,120 Z',
    colorClass: 'fill-emerald-100 hover:fill-emerald-200 stroke-emerald-600',
    darkColorClass: 'dark:fill-emerald-950/40 dark:hover:fill-emerald-900/60 dark:stroke-emerald-500',
    permitsCount: 14,
    qualityIndex: 68.4,
    dominantSector: 'Agroindustri & Logistik'
  },
  {
    id: 'ptk-barat',
    name: 'Pontianak Barat',
    pathData: 'M 30,120 L 150,140 L 130,220 L 30,200 Z',
    colorClass: 'fill-teal-100 hover:fill-teal-200 stroke-teal-600',
    darkColorClass: 'dark:fill-teal-950/40 dark:hover:fill-teal-900/60 dark:stroke-teal-500',
    permitsCount: 22,
    qualityIndex: 62.5,
    dominantSector: 'Pembangunan & Jasa'
  },
  {
    id: 'ptk-kota',
    name: 'Pontianak Kota',
    pathData: 'M 150,140 L 250,130 L 240,210 L 130,220 Z',
    colorClass: 'fill-emerald-200 hover:fill-emerald-300 stroke-emerald-700',
    darkColorClass: 'dark:fill-emerald-900/40 dark:hover:fill-emerald-850 dark:stroke-emerald-400',
    permitsCount: 31,
    qualityIndex: 66.8,
    dominantSector: 'Perkantoran & Niaga'
  },
  {
    id: 'ptk-selatan',
    name: 'Pontianak Selatan',
    pathData: 'M 250,130 L 370,110 L 350,190 L 240,210 Z',
    colorClass: 'fill-lime-100 hover:fill-lime-200 stroke-lime-600',
    darkColorClass: 'dark:fill-lime-950/30 dark:hover:fill-lime-900/50 dark:stroke-lime-500',
    permitsCount: 27,
    qualityIndex: 64.9,
    dominantSector: 'Pemukiman & Hotel'
  },
  {
    id: 'ptk-tenggara',
    name: 'Pontianak Tenggara',
    pathData: 'M 240,210 L 350,190 L 330,270 L 205,260 Z',
    colorClass: 'fill-green-150 hover:fill-green-250 stroke-green-600',
    darkColorClass: 'dark:fill-green-950/40 dark:hover:fill-green-900/60 dark:stroke-green-500',
    permitsCount: 18,
    qualityIndex: 71.2,
    dominantSector: 'Pendidikan & Ruang Hijau'
  },
  {
    id: 'ptk-timur',
    name: 'Pontianak Timur',
    pathData: 'M 150,140 L 220,100 L 370,110 L 250,130 Z',
    colorClass: 'fill-emerald-50 hover:fill-emerald-150 stroke-emerald-500',
    darkColorClass: 'dark:fill-stone-800 dark:hover:fill-stone-750 dark:stroke-stone-600',
    permitsCount: 16,
    qualityIndex: 59.8,
    dominantSector: 'Kawasan Industri Kecil'
  }
];

// Interactive environmental objects pins (plotted perfectly relative to subdistrict shapes)
const ENVIRONMENTAL_OBJECTS: EnvironmentalObject[] = [
  { id: 'O-01', name: 'IPAL Komunal Industri Siantan', subdistrict: 'Pontianak Utara', type: 'AMDAL', status: 'AKTIF', latitude: 70, longitude: 75, desc: 'Pemantauan berkala baku mutu air limbah cair terpadu.' },
  { id: 'O-02', name: 'Kawasan Hutan Kota Untan', subdistrict: 'Pontianak Tenggara', type: 'SPPL', status: 'AKTIF', latitude: 235, longitude: 270, desc: 'Ekosistem konservasi keanekaragaman hayati perkotaan.' },
  { id: 'O-03', name: 'Pusat Medis RSUD Syarif Mohamad', subdistrict: 'Pontianak Kota', type: 'UKL-UPL', status: 'PENGAWASAN', latitude: 175, longitude: 180, desc: 'Pengelolaan limbah B3 medis termitigasi.' },
  { id: 'O-04', name: 'Penggergajian Kayu Khatulistiwa', subdistrict: 'Pontianak Barat', type: 'AMDAL', status: 'PENGAWASAN', latitude: 155, longitude: 70, desc: 'Evaluasi polusi partikel debu dan kebisingan gergaji.' },
  { id: 'O-05', name: 'Sektor Perhotelan & Resto Gajahmada', subdistrict: 'Pontianak Selatan', type: 'UKL-UPL', status: 'AKTIF', latitude: 150, longitude: 290, desc: 'Kepatuhan sumur resapan air hujan & grease trap dapur.' },
  { id: 'O-06', name: 'Depo Pengolahan Sampah Parit Haji Husin', subdistrict: 'Pontianak Tenggara', type: 'UKL-UPL', status: 'AKTIF', latitude: 220, longitude: 310, desc: 'Kawasan bank sampah 3R terintegrasi.' }
];

export const EnvironmentalMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<Subdistrict | null>(SUBDISTRICTS_DATA[2]); // Default selection ptk-kota
  const [activeFilter, setActiveFilter] = useState<'SEMUA' | 'AMDAL' | 'UKL-UPL' | 'SPPL'>('SEMUA');
  const [hoveredObject, setHoveredObject] = useState<EnvironmentalObject | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Direct D3 integration to add micro-animations and manage the projection/selection programmatically
    const svg = d3.select(svgRef.current);
    
    // Smooth pulse for glowing points of interest using D3 transition loop
    const animatePins = () => {
      svg.selectAll('.permit-pin-pulse')
        .transition()
        .duration(1500)
        .attr('r', 10)
        .attr('opacity', 0)
        .transition()
        .duration(0)
        .attr('r', 4)
        .attr('opacity', 0.8)
        .on('end', animatePins);
    };

    animatePins();
  }, [activeFilter]);

  const filteredObjects = activeFilter === 'SEMUA' 
    ? ENVIRONMENTAL_OBJECTS 
    : ENVIRONMENTAL_OBJECTS.filter(obj => obj.type === activeFilter);

  return (
    <div className="bg-white dark:bg-stone-900 border border-emerald-100 dark:border-stone-850 rounded-2xl p-6 text-left shadow-sm space-y-6" id="d3-peta-interaktif-container">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 dark:border-stone-800 pb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#2D6A4F] dark:text-emerald-400 bg-[#E5F5EB] dark:bg-stone-800 px-2 py-0.5 rounded-md font-mono">
              Sebaran D3.js Map
            </span>
            <h3 className="text-sm font-extrabold text-[#1B4332] dark:text-stone-100">
              Peta Sebaran Obyek & Kelaikan Izin Lingkungan hidup
            </h3>
            <p className="text-[10.5px] text-slate-500">
              Visualisasi zonifikasi IKLH dan pemantauan aktif objek berizin Dinas Lingkungan Hidup.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {(['SEMUA', 'AMDAL', 'UKL-UPL', 'SPPL'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2 py-1 text-[9.5px] font-bold rounded-lg transition border ${
                  activeFilter === f
                    ? 'bg-[#1B4332] text-white border-[#1B4332] dark:bg-emerald-600 dark:border-emerald-500'
                    : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700 hover:bg-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-7 bg-[#FAFBF9] dark:bg-stone-850/35 rounded-xl border border-dashed border-emerald-100/60 dark:border-stone-800 p-3 relative flex items-center justify-center">
          
          <svg
            ref={svgRef}
            viewBox="0 0 400 300"
            className="w-full h-auto max-h-[340px] drop-shadow-sm select-none"
          >
            {/* Background grids / environmental grid indicators */}
            <g className="stroke-slate-100 dark:stroke-stone-800/40" strokeWidth="0.5">
              {Array.from({ length: 15 }).map((_, i) => (
                <line key={`x-${i}`} x1={i * 30} y1={0} x2={i * 30} y2={300} />
              ))}
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={`y-${i}`} x1={0} y1={i * 30} x2={400} y2={i * 30} />
              ))}
            </g>

            {/* Kapuas River (Sore & Nature Blue Curve representation) */}
            <path
              d="M -10,135 Q 150,140 220,100 T 410,110"
              fill="none"
              className="stroke-amber-400 dark:stroke-teal-900"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.3"
            />
            <path
              d="M -10,135 Q 150,140 220,100 T 410,110"
              fill="none"
              className="stroke-cyan-500/80 dark:stroke-emerald-600/50"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="4 2"
            />

            {/* Sub-District Path Geometries */}
            <g id="regions-group">
              {SUBDISTRICTS_DATA.map((region) => {
                const isSelected = selectedSubdistrict?.id === region.id;
                return (
                  <path
                    key={region.id}
                    d={region.pathData}
                    onClick={() => setSelectedSubdistrict(region)}
                    className={`cursor-pointer transition duration-300 stroke-[1.2] ${region.colorClass} ${region.darkColorClass} ${
                      isSelected 
                        ? 'fill-emerald-300/60 dark:fill-emerald-800/65 stroke-emerald-900 dark:stroke-emerald-300 stroke-[2] shadow-inner' 
                        : ''
                    }`}
                  />
                );
              })}
            </g>

            {/* Dynamic Interactive Object Pins */}
            <g id="pins-group">
              {filteredObjects.map((obj) => {
                const isHovered = hoveredObject?.id === obj.id;
                // Pin point colors
                const colorMap = {
                  'AMDAL': '#EF4444', // Rose Red
                  'UKL-UPL': '#F59E0B', // Amber
                  'SPPL': '#10B981' // Emerald Emerald
                };

                return (
                  <g
                    key={obj.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredObject(obj)}
                    onMouseLeave={() => setHoveredObject(null)}
                  >
                    {/* Pulsing Outer Bloom (Uses D3 class targeting above) */}
                    <circle
                      cx={obj.latitude}
                      cy={obj.longitude}
                      className="permit-pin-pulse"
                      r="4"
                      fill={colorMap[obj.type]}
                      opacity="0.8"
                    />
                    
                    {/* Core Anchor Dot */}
                    <circle
                      cx={obj.latitude}
                      cy={obj.longitude}
                      r={isHovered ? "5" : "3.5"}
                      fill={colorMap[obj.type]}
                      className="stroke-white dark:stroke-stone-900 transition-all duration-300"
                      strokeWidth="1.2"
                    />

                    {/* Miniature Code Text Tooltip overlay */}
                    {isHovered && (
                      <g className="pointer-events-none transition-all">
                        <rect
                          x={obj.latitude - 55}
                          y={obj.longitude - 28}
                          width="110"
                          height="18"
                          rx="4"
                          fill="#1E293B"
                          opacity="0.92"
                        />
                        <text
                          x={obj.latitude}
                          y={obj.longitude - 16}
                          fill="#FFFFFF"
                          fontSize="7"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {obj.name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Compass layout indicator */}
          <div className="absolute bottom-3 left-3 flex flex-col items-start font-mono text-[8px] text-slate-400">
            <span>UTARA ↑</span>
            <span>UJI KOORDINAT: S 0° 2' - E 109° 20'</span>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[8.5px] bg-white dark:bg-stone-900 border border-slate-100 dark:border-stone-800 rounded px-2 py-0.5 shadow-xs text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Sungai Kapuas
          </div>
        </div>

        {/* Selected Data Sheet / Inspect Pane */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Subdistrict Details Card */}
          {selectedSubdistrict && (
            <div className="bg-slate-50 dark:bg-stone-850 p-4.5 rounded-xl border border-slate-100 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-100/10 dark:border-stone-870 pb-2">
                <span className="text-xs font-black text-[#1B4332] dark:text-emerald-400 tracking-tight">
                  Kecamatan: {selectedSubdistrict.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded font-extrabold">
                  {selectedSubdistrict.permitsCount} Obyek Izin
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="bg-white dark:bg-stone-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-stone-800">
                  <span className="text-[8.5px] uppercase font-bold tracking-widest text-slate-400 block">IKLH Udara & Air</span>
                  <span className="text-base font-black text-[#2D6A4F] dark:text-emerald-400 font-mono">
                    {selectedSubdistrict.qualityIndex}
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono block">Status: Kondusif</span>
                </div>

                <div className="bg-white dark:bg-stone-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-stone-800">
                  <span className="text-[8.5px] uppercase font-bold tracking-widest text-slate-400 block">Sektor Dominan</span>
                  <span className="text-[10.5px] font-extrabold text-slate-700 dark:text-stone-300 block line-clamp-1 truncate leading-normal" title={selectedSubdistrict.dominantSector}>
                    {selectedSubdistrict.dominantSector}
                  </span>
                  <span className="text-[8px] text-slate-450 block leading-tight">Pengawasan Reguler</span>
                </div>
              </div>
            </div>
          )}

          {/* Environmental Objects Inspection details */}
          <div className="border border-slate-100 dark:border-stone-850 p-4 rounded-xl space-y-2">
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1">
              <Info className="w-3" />
              INSPEKSI FASILITAS LINGKUNGAN ({filteredObjects.length} AKTIF)
            </span>
            
            <p className="text-[10.5px] text-slate-500 leading-relaxed font-normal">
              Arahkan kursor Anda ke titik koordinat <span className="text-red-500 font-extrabold">● Merah</span>, <span className="text-amber-500 font-extrabold">● Kuning</span>, atau <span className="text-emerald-500 font-extrabold">● Hijau</span> untuk melihat informasi kepatuhan ekologis lingkungan obyek tersebut.
            </p>

            {hoveredObject ? (
              <div className="bg-[#FFFDF6] dark:bg-amber-950/20 p-3 rounded-lg border border-amber-100/40 dark:border-amber-900/40 text-left space-y-1 animate-pulse">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-300 block">
                    {hoveredObject.name}
                  </span>
                  <span className="text-[7.5px] font-mono bg-red-100 dark:bg-red-950/40 text-red-900 dark:text-red-300 font-black px-1.5 rounded">
                    {hoveredObject.type}
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-stone-350 leading-relaxed font-medium">
                  {hoveredObject.desc}
                </p>
                <div className="flex justify-between items-center text-[8.5px] text-slate-400 pt-1 font-mono border-t border-dashed border-amber-100/20">
                  <span>Lokasi: {hoveredObject.subdistrict}</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{hoveredObject.status}</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#F9FBFA] dark:bg-stone-850/25 p-4 rounded-lg border border-emerald-50/20 text-center text-[10px] text-slate-400 font-normal py-6">
                Belum ada objek difokuskan. Arahkan kursor ke dalam peta di sebelah kiri.
              </div>
            )}
          </div>
          
          {/* Quick legend info box */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-[9.5px] text-slate-500 font-mono border-t border-slate-50 dark:border-stone-850 pt-2 shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 block"></span> AMDAL
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 block"></span> UKL-UPL
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span> SPPL
            </span>
            <span className="text-[8px] text-slate-400">Total Objek Terkendali: 128</span>
          </div>

        </div>
      </div>
    </div>
  );
};
