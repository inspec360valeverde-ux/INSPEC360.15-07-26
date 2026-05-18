import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Structure } from '../../data/types';

// Fix default icon paths
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS: Record<string, string> = {
  pendente: '#6b7280',
  'em-andamento': '#AA8933',
  concluido: '#16a34a',
  anomalia: '#dc2626',
  atrasado: '#ea580c',
};

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  'em-andamento': 'Em Andamento',
  concluido: 'Concluído',
  anomalia: 'Anomalia',
  atrasado: 'Atrasado',
};

function makeIcon(color: string, pulse = false) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        ${pulse ? `<div style="position:absolute;width:28px;height:28px;border-radius:50%;background:${color};opacity:0.3;animation:pulse 1.5s infinite;"></div>` : ''}
        <div style="
          width:20px;height:20px;border-radius:50% 50% 50% 0;
          background:${color};
          transform:rotate(-45deg);
          border:2px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.4);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 22],
    popupAnchor: [0, -24],
  });
}

function makeAddIcon() {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:32px;height:32px;border-radius:50%;
        background:#AA8933;
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.5);
        display:flex;align-items:center;justify-content:center;
        color:white;font-size:20px;line-height:1;
        cursor:pointer;
      ">+</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

interface MapComponentProps {
  structures: Structure[];
  onMapClick?: (lat: number, lng: number) => void;
  pendingPin?: { lat: number; lng: number } | null;
  onStructureClick?: (structure: Structure) => void;
  isAddingMode?: boolean;
}

export function MapComponent({
  structures,
  onMapClick,
  pendingPin,
  onStructureClick,
  isAddingMode = false,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const pendingMarkerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Craibas, AL center
  const CENTER: [number, number] = [-9.4419, -36.7673];

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: CENTER,
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // 40km reference circle
    circleRef.current = L.circle(CENTER, {
      radius: 40000,
      color: '#AA8933',
      fillColor: '#AA8933',
      fillOpacity: 0.04,
      weight: 1.5,
      dashArray: '6,4',
    }).addTo(map);

    // Center marker
    L.marker(CENTER, {
      icon: L.divIcon({
        className: '',
        html: `<div style="
          background:#193A2A;color:white;
          font-size:8px;padding:3px 6px;border-radius:4px;
          white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.3);
          font-family:sans-serif;
        ">⛏ Vale Verde</div>`,
        iconAnchor: [40, 14],
      }),
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Click handler
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function onClick(e: L.LeafletMouseEvent) {
      if (isAddingMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }

    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [isAddingMode, onMapClick]);

  // Cursor style
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getContainer().style.cursor = isAddingMode ? 'crosshair' : '';
  }, [isAddingMode]);

  // Structures markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    structures.forEach((s) => {
      const color = STATUS_COLORS[s.status] || '#6b7280';
      const marker = L.marker([s.lat, s.lng], { icon: makeIcon(color) });

      const popupContent = `
        <div style="font-family:sans-serif;min-width:160px;">
          <div style="font-weight:600;color:#193A2A;font-size:13px;margin-bottom:4px;">${s.name}</div>
          <div style="font-size:11px;color:#555;margin-bottom:2px;">Tipo: ${s.type}</div>
          <div style="font-size:11px;color:#555;margin-bottom:2px;">Progressiva: ${s.progressiva.toLocaleString('pt-BR')} m</div>
          <div style="font-size:11px;color:#555;margin-bottom:6px;">${s.lt}</div>
          <div style="display:inline-block;font-size:10px;padding:2px 8px;border-radius:12px;background:${color};color:white;">
            ${STATUS_LABELS[s.status] || s.status}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 220 });
      marker.on('click', () => onStructureClick?.(s));
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [structures, onStructureClick]);

  // Pending pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pendingMarkerRef.current) {
      pendingMarkerRef.current.remove();
      pendingMarkerRef.current = null;
    }

    if (pendingPin) {
      pendingMarkerRef.current = L.marker([pendingPin.lat, pendingPin.lng], {
        icon: makeAddIcon(),
      }).addTo(map);
    }
  }, [pendingPin]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-3 z-[1000]">
        <div className="text-xs font-medium mb-2" style={{ color: '#193A2A' }}>Legenda</div>
        <div className="space-y-1">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[key] }}
              />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
          <div
            className="w-12 h-0.5"
            style={{ borderTop: '1.5px dashed #AA8933' }}
          />
          <span className="text-xs text-gray-400">Raio 40km</span>
        </div>
      </div>

      {isAddingMode && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur rounded-xl px-4 py-2 shadow-lg z-[1000] text-xs"
          style={{ color: '#AA8933' }}
        >
          Toque no mapa para posicionar a estrutura
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
