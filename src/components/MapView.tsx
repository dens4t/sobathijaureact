import React from 'react';
import * as Icons from 'lucide-react';
import type { GeoCategory, GeoLocation } from '../types';
import { EnvironmentalMap } from './EnvironmentalMap';

interface MapViewProps {
  locations: GeoLocation[];
  categories: GeoCategory[];
}

export const MapView: React.FC<MapViewProps> = ({ locations, categories }) => {
  const sortedCats = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Main Map */}
      <div className="bg-white border p-4 md:p-6 rounded-2xl shadow-sm">
        <h3 className="text-base md:text-lg font-black tracking-tight text-[#1B4332] mb-1">Peta Sebaran Lingkungan</h3>
        <p className="text-xs text-slate-500 mb-4">
          Visualisasi titik-titik pengelolaan lingkungan di Kota Pontianak. Klik marker untuk detail lokasi.
        </p>
        <EnvironmentalMap
          locations={locations}
          categories={categories}
          height="520px"
        />
      </div>

      {/* Category Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedCats.map(cat => {
          const IconComp = (Icons as any)[cat.iconName] || Icons.MapPin;
          const catLocations = locations.filter(l => l.category === cat.name);
          return (
            <div
              key={cat.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-center gap-3 p-4 pb-3 border-b border-slate-100">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0"
                  style={{ backgroundColor: cat.markerColor }}
                >
                  <IconComp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-extrabold text-slate-800">{cat.name}</h4>
                  <p className="text-[10px] text-slate-500">{cat.shortDesc}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-slate-700">{catLocations.length}</span>
                  <p className="text-[8px] text-slate-400 font-mono uppercase">Titik</p>
                </div>
              </div>

              {/* Rich Description */}
              <div className="px-4 py-3 text-slate-600 text-xs leading-relaxed space-y-3
                [&_strong]:font-bold [&_strong]:text-emerald-700
                [&_em]:italic [&_em]:text-slate-500
                [&_h4]:font-bold [&_h4]:text-xs [&_h4]:uppercase [&_h4]:tracking-wider
                [&_p]:text-xs [&_p]:leading-relaxed
                [&_.bg-amber-50]:bg-amber-50/80
                [&_.bg-emerald-50]:bg-emerald-50/80
                [&_.bg-blue-50]:bg-blue-50/80
                [&_.bg-green-50]:bg-green-50/80
                [&_.rounded-xl]:rounded-xl
                [&_.rounded-lg]:rounded-lg
                [&_ol]:space-y-1 [&_ol_li]:text-xs
              ">
                <div dangerouslySetInnerHTML={{ __html: cat.description }} />
              </div>

              {/* Location names */}
              {catLocations.length > 0 && (
                <div className="px-4 pb-4">
                  <details className="group">
                    <summary className="text-[10px] font-bold text-slate-400 cursor-pointer hover:text-slate-600 transition list-none flex items-center gap-1">
                      <span>📍 Daftar {catLocations.length} lokasi</span>
                      <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {catLocations.map(loc => (
                        <li key={loc.id} className="flex items-center gap-2 text-[10px] text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cat.markerColor }} />
                          <span className="font-medium">{loc.name}</span>
                          <span className="text-slate-400">— {loc.address}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
