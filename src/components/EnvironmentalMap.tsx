import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoCategory, GeoLocation } from '../types';

// Fix default Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface EnvironmentalMapProps {
  locations: GeoLocation[];
  categories: GeoCategory[];
  selectedLocationId?: string | null;
  onSelectLocation?: (loc: GeoLocation) => void;
  onMapClick?: (lat: number, lng: number) => void;
  pickedPosition?: { lat: number; lng: number } | null;
  height?: string;
  interactive?: boolean;
}

const ICON_SVG_PATHS: Record<string, string> = {
  Trash2: '<path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11v6M14 11v6" stroke="white" stroke-width="2" stroke-linecap="round"/>',
  Landfill: '<path d="M4 20h16M6 20l2-12h8l2 12" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M10 8V4h4v4" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>',
  Recycle: '<path d="M12 2l4 4h-3v6h-2V6H8l4-4zM12 22l-4-4h3v-6h2v6h3l-4 4z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M2 12l4-4v3h6v2H6v3l-4-4zM22 12l-4 4v-3h-6v-2h6V8l4 4z" stroke="white" stroke-width="2" fill="none"/>',
  MapPin: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="9" r="2.5" fill="none" stroke="white" stroke-width="2"/>',
  TreePine: '<path d="M12 2L6 12h3v4h6v-4h3L12 2zM10 16v4h4v-4" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>',
  Droplets: '<path d="M12 2C10 6 6 10 6 14a6 6 0 0012 0c0-4-4-8-6-12z" fill="none" stroke="white" stroke-width="2"/><path d="M9 14a3 3 0 003 3" stroke="white" stroke-width="2" fill="none"/>',
  Leaf: '<path d="M12 2L2 12h4v6h12v-6h4L12 2z" fill="none" stroke="white" stroke-width="2"/><path d="M12 16V8" stroke="white" stroke-width="2"/>',
};

function getSvgForIcon(iconName: string): string {
  const path = ICON_SVG_PATHS[iconName];
  if (path) return `<svg viewBox="0 0 24 24" width="18" height="18">${path}</svg>`;
  return `<span style="color:white;font-size:14px;font-weight:700;font-family:system-ui;">${iconName[0]}</span>`;
}

function createColoredIcon(iconName: string, color: string, size: number = 40): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">${getSvgForIcon(iconName)}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export const EnvironmentalMap: React.FC<EnvironmentalMapProps> = ({
  locations,
  categories,
  selectedLocationId,
  onSelectLocation,
  onMapClick,
  pickedPosition,
  height = '420px',
  interactive = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const pickedMarkerRef = useRef<L.Marker | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('SEMUA');

  const filteredLocations = activeFilter === 'SEMUA'
    ? locations
    : locations.filter(l => l.category === activeFilter);

  const getCatCount = (catName: string) =>
    locations.filter(l => l.category === catName).length;

  const getCatColor = (catName: string): string => {
    const cat = categories.find(c => c.name === catName);
    return cat?.markerColor || '#78716C';
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-0.016, 109.342] as L.LatLngExpression,
      zoom: 13,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current.clear();

    const bounds = L.latLngBounds([]);

    filteredLocations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createColoredIcon(loc.iconName, loc.color, selectedLocationId === loc.id ? 48 : 36),
      });

      const cat = categories.find(c => c.name === loc.category);

      const popupHtml = `<div style="font-family:system-ui,sans-serif;min-width:200px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #e2e8f0;">
          <div style="width:24px;height:24px;border-radius:50%;background:${loc.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${getSvgForIcon(loc.iconName)}
          </div>
          <div>
            <strong style="font-size:13px;color:#1e293b;">${loc.name}</strong>
            <div style="font-size:9px;color:${cat?.markerColor || '#78716C'};font-weight:600;margin-top:1px;">${loc.category}</div>
          </div>
        </div>
        <div style="font-size:10px;color:#64748b;margin-bottom:4px;">📍 ${loc.address}</div>
        <div style="font-size:10px;color:#78716c;line-height:1.4;">${loc.description}</div>
        <div style="margin-top:6px;font-size:9px;color:#94a3b8;font-family:monospace;">
          ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}
        </div>
      </div>`;

      marker.bindPopup(popupHtml, { closeButton: true, maxWidth: 320 });

      if (onSelectLocation) {
        marker.on('click', () => onSelectLocation(loc));
      }

      marker.addTo(map);
      markersRef.current.set(loc.id, marker);
      bounds.extend([loc.lat, loc.lng]);
    });

    if (filteredLocations.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    if (selectedLocationId) {
      const marker = markersRef.current.get(selectedLocationId);
      if (marker) marker.openPopup();
    }
  }, [filteredLocations, selectedLocationId, onSelectLocation, categories]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (pickedMarkerRef.current) {
      map.removeLayer(pickedMarkerRef.current);
      pickedMarkerRef.current = null;
    }
    if (pickedPosition) {
      pickedMarkerRef.current = L.marker([pickedPosition.lat, pickedPosition.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:44px;height:44px;background:#1B4332;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(0,0,0,0.4);border:3px solid #34D399;">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="none" stroke="white" stroke-width="2"/><circle cx="12" cy="9" r="2.5" fill="none" stroke="white" stroke-width="2"/></svg>
          </div>`,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        }),
      }).addTo(map);
    }
  }, [pickedPosition]);

  return (
    <div className="bg-white dark:bg-stone-900 border border-emerald-100 dark:border-stone-800 rounded-2xl p-4 text-left shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#2D6A4F] dark:text-emerald-400 bg-[#E5F5EB] dark:bg-stone-800 px-2 py-0.5 rounded-md font-mono">
            Peta Interaktif
          </span>
          <h3 className="text-sm font-extrabold text-[#1B4332] dark:text-stone-100">
            Peta Sebaran Lingkungan
          </h3>
          <p className="text-[10.5px] text-slate-500">
            {locations.length} titik tersebar di {categories.length} kategori
          </p>
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 shrink-0 max-w-[70%]">
            <button
              onClick={() => setActiveFilter('SEMUA')}
              className={`px-2.5 py-1 text-[9.5px] font-bold rounded-lg transition border ${
                activeFilter === 'SEMUA'
                  ? 'bg-[#1B4332] text-white border-[#1B4332] dark:bg-emerald-600 dark:border-emerald-500'
                  : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700 hover:bg-slate-100'
              }`}
            >
              SEMUA ({locations.length})
            </button>
            {[...categories].sort((a, b) => a.order - b.order).map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.name)}
                className={`px-2.5 py-1 text-[9.5px] font-bold rounded-lg transition border ${
                  activeFilter === cat.name
                    ? 'bg-[#1B4332] text-white border-[#1B4332]'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.name} ({getCatCount(cat.name)})
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={mapRef}
        className="w-full rounded-xl border border-slate-100 overflow-hidden z-0"
        style={{ height }}
      />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 border-t border-slate-50 pt-3">
        <span className="font-bold text-slate-400">Legenda:</span>
        {[...categories].sort((a, b) => a.order - b.order).map(cat => (
          <span key={cat.id} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.markerColor }}></span>
            {cat.name}
          </span>
        ))}
        <span className="text-[9px] text-slate-400 ml-auto">
          Sumber: DLH Kota Pontianak · OpenStreetMap
        </span>
      </div>
    </div>
  );
};
