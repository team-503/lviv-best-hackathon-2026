import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// ─── Pin icon for the picker ───
const PIN_ICON = L.divIcon({
  html: `<div style="width:28px;height:36px;display:flex;align-items:flex-end;justify-content:center;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="28" height="36">
      <path d="M16 0C9.4 0 4 5.4 4 12c0 9 12 28 12 28s12-19 12-28C28 5.4 22.6 0 16 0z" fill="#ef4444"/>
      <circle cx="16" cy="12" r="5" fill="white" opacity="0.9"/>
      <circle cx="16" cy="12" r="3" fill="#ef4444"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
});

// ─── Inner component: handles click events inside MapContainer ───
function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ─── Sync map center when value resets ───
function MapSync({ value }: { value: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (!value) map.setView([49.835, 24.02], 13);
  }, [value, map]);
  return null;
}

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  return (
    <div className="relative rounded-lg overflow-hidden border" style={{ height: 200 }}>
      <MapContainer
        center={value ? [value.lat, value.lng] : [49.835, 24.02]}
        zoom={13}
        className="h-full w-full z-0"
        style={{ cursor: 'crosshair' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        <MapSync value={value} />
        {value && <Marker position={[value.lat, value.lng]} icon={PIN_ICON} />}
      </MapContainer>

      {!value && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/20 text-white">
          <MapPin className="size-5" />
          <span className="text-xs font-medium">Клацніть на карті щоб обрати місце</span>
        </div>
      )}

      {value && (
        <div className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded bg-black/60 px-2 py-0.5 text-xs text-white font-mono">
          {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </div>
      )}
    </div>
  );
}
