import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapPoint, PlanRouteResponseDto } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Warehouse, MapPin, ExternalLink } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

// Fix default icon paths broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ROUTE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

// ─── Icons ───
function createPointIcon(type: 'warehouse' | 'point', isHovered = false) {
  const warehouseColor = '#6366f1';
  const warehouseStroke = '#4338ca';
  const pointColor = '#16a34a';
  const pointStroke = '#15803d';
  const color = type === 'warehouse' ? warehouseColor : pointColor;

  const wrapStyle = isHovered
    ? `style="transform:scale(1.25);transform-origin:50% 100%;filter:drop-shadow(0 0 6px ${color}cc) drop-shadow(0 0 12px ${color}66);"`
    : `style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.18)) drop-shadow(0 1px 1px rgba(0,0,0,0.08));"`;

  const svgWarehouse = `
    <div ${wrapStyle}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
        <path d="M16 0C9.4 0 4 5.4 4 12c0 9 12 28 12 28s12-19 12-28C28 5.4 22.6 0 16 0z"
          fill="${warehouseColor}" stroke="${warehouseStroke}" stroke-width="1"/>
        <rect x="10" y="10" width="12" height="10" rx="1" fill="white" opacity="0.9"/>
        <rect x="10" y="10" width="12" height="3" rx="1" fill="white"/>
        <rect x="14" y="16" width="4" height="4" rx="0.5" fill="${warehouseColor}"/>
      </svg>
    </div>`;

  const svgPoint = `
    <div ${wrapStyle}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
        <path d="M16 0C9.4 0 4 5.4 4 12c0 9 12 28 12 28s12-19 12-28C28 5.4 22.6 0 16 0z"
          fill="${pointColor}" stroke="${pointStroke}" stroke-width="1"/>
        <circle cx="16" cy="13" r="5" fill="white" opacity="0.9"/>
        <circle cx="16" cy="13" r="3" fill="${pointColor}"/>
      </svg>
    </div>`;

  return L.divIcon({
    html: type === 'warehouse' ? svgWarehouse : svgPoint,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

function createStopNumberIcon(order: number, color: string, isWarehouse: boolean) {
  const label = isWarehouse ? '🏭' : String(order);
  const size = isWarehouse ? 28 : 24;
  const fontSize = isWarehouse ? 12 : 11;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;font-weight:700;color:white;font-family:system-ui,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.35);line-height:1;">${label}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ─── Popup ───
function PointPopup({ point }: { point: MapPoint }) {
  const navigate = useNavigate();
  const isWarehouse = point.type === 'warehouse';

  return (
    <div className="min-w-[220px] max-w-[280px]">
      <div className="flex items-start gap-2 mb-2">
        <div
          className={`flex size-7 shrink-0 items-center justify-center rounded-md ${isWarehouse ? 'bg-indigo-500/15' : 'bg-primary/15'}`}
        >
          {isWarehouse ? (
            <Warehouse className="size-4 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <MapPin className="size-4 text-primary" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">{point.name}</p>
        </div>
      </div>

      <Badge variant={isWarehouse ? 'secondary' : 'outline'} className="mb-2 text-xs">
        {isWarehouse ? 'Склад' : 'Точка доставки'}
      </Badge>

      <Separator className="my-2" />
      <Button
        size="sm"
        variant="outline"
        className="w-full h-7 text-xs"
        onClick={() => navigate(isWarehouse ? `/warehouse/${point.id}` : `/point/${point.id}`)}
      >
        <ExternalLink className="size-3" data-icon="inline-start" />
        {isWarehouse ? 'Керувати складом' : 'Керувати точкою'}
      </Button>
    </div>
  );
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

// ─── Fly-to + open popup on sidebar click ───
function MapController({
  flyToTrigger,
  points,
  markerRefs,
}: {
  flyToTrigger: { id: number; type: 'warehouse' | 'point'; key: number } | null;
  points: MapPoint[];
  markerRefs: React.RefObject<Record<string, L.Marker>>;
}) {
  const map = useMap();
  const prevKey = useRef<number | null>(null);

  useEffect(() => {
    if (!flyToTrigger || flyToTrigger.key === prevKey.current) return;
    prevKey.current = flyToTrigger.key;

    const point = points.find((p) => p.id === flyToTrigger.id && p.type === flyToTrigger.type);
    if (!point) return;

    const targetZoom = Math.max(map.getZoom(), 15);
    map.flyTo([point.lat, point.lng], targetZoom, { duration: 0.6 });

    setTimeout(() => {
      markerRefs.current[`${flyToTrigger.type}:${flyToTrigger.id}`]?.openPopup();
    }, 750);
  }, [flyToTrigger, map, points, markerRefs]);

  return null;
}

/** Build polyline coordinates and stop markers from API plan routes */
function buildApiRouteData(route: PlanRouteResponseDto, color: string) {
  const coords: [number, number][] = [];
  const stops: { lat: number; lng: number; order: number; isWarehouse: boolean; color: string; key: string }[] = [];

  for (const stop of route.stops) {
    coords.push([stop.location.lat, stop.location.lng]);
    stops.push({
      lat: stop.location.lat,
      lng: stop.location.lng,
      order: stop.order,
      isWarehouse: stop.locationType === 'warehouse',
      color,
      key: `${route.id}-${stop.order}`,
    });
  }

  return { coords, stops };
}

// ─── Main component ───
interface MapViewProps {
  selectedPointKey: string | null;
  onSelectPoint: (key: string | null) => void;
  planRoutes?: PlanRouteResponseDto[];
  hoveredPoint?: { id: number; type: 'warehouse' | 'point' } | null;
  flyToTrigger?: { id: number; type: 'warehouse' | 'point'; key: number } | null;
}

export function MapView({
  selectedPointKey,
  onSelectPoint,
  planRoutes = [],
  hoveredPoint = null,
  flyToTrigger = null,
}: MapViewProps) {
  const center: [number, number] = [49.835, 24.02];
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const points = useAppSelector((s) => s.mapPoints.points);

  const routeVisuals = useMemo(
    () =>
      planRoutes.map((route, idx) => {
        const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
        const { coords, stops } = buildApiRouteData(route, color);
        return { routeId: route.id, color, coords, stops };
      }),
    [planRoutes],
  );

  return (
    <MapContainer center={center} zoom={13} className="h-full w-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResizer />
      <MapController flyToTrigger={flyToTrigger ?? null} points={points} markerRefs={markerRefs} />

      {/* ── Plan / Simulation routes ── */}
      {routeVisuals.map(({ routeId, color, coords, stops }) => (
        <div key={routeId}>
          {coords.length >= 2 && <Polyline positions={coords} pathOptions={{ color, weight: 4, opacity: 0.85 }} />}
          {stops.map((stop) => (
            <Marker
              key={stop.key}
              position={[stop.lat, stop.lng]}
              icon={createStopNumberIcon(stop.order, stop.color, stop.isWarehouse)}
              zIndexOffset={1000}
            />
          ))}
        </div>
      ))}

      {/* ── Base markers ── */}
      {points.map((point) => {
        const markerKey = `${point.type}:${point.id}`;
        const isHovered = hoveredPoint?.id === point.id && hoveredPoint?.type === point.type;
        return (
          <Marker
            key={markerKey}
            position={[point.lat, point.lng]}
            icon={createPointIcon(point.type, isHovered)}
            ref={(m: L.Marker | null) => {
              if (m) markerRefs.current[markerKey] = m;
              else delete markerRefs.current[markerKey];
            }}
            eventHandlers={{ click: () => onSelectPoint(selectedPointKey === markerKey ? null : markerKey) }}
          >
            <Popup>
              <PointPopup point={point} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
