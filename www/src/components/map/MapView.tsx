import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getProductById, type MapPoint } from '@/data/mockData';
import type { SimRoute } from '@/utils/algorithm';
import { CriticalityBadge } from '@/components/ui/criticality-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, Warehouse, MapPin, ExternalLink } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

// Fix default icon paths broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ROUTE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

function getVehicleColor(vehicleId: string, vehicles: { id: string }[]): string {
  const idx = vehicles.findIndex((v) => v.id === vehicleId);
  return ROUTE_COLORS[idx % ROUTE_COLORS.length];
}

// ─── Icons ───
function createPointIcon(type: 'warehouse' | 'delivery', hasUrgent: boolean, isHovered = false) {
  const warehouseColor = '#6366f1';
  const deliveryColor = '#2563eb';
  const color = type === 'warehouse' ? warehouseColor : deliveryColor;

  const wrapStyle = isHovered
    ? `style="transform:scale(1.25);transform-origin:50% 100%;filter:drop-shadow(0 0 6px ${color}cc) drop-shadow(0 0 12px ${color}66);"`
    : '';

  const svgWarehouse = `
    <div ${wrapStyle}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
        <path d="M16 0C9.4 0 4 5.4 4 12c0 9 12 28 12 28s12-19 12-28C28 5.4 22.6 0 16 0z"
          fill="${warehouseColor}" ${hasUrgent ? `stroke="#ef4444" stroke-width="2"` : ''}/>
        <rect x="10" y="10" width="12" height="10" rx="1" fill="white" opacity="0.9"/>
        <rect x="10" y="10" width="12" height="3" rx="1" fill="white"/>
        <rect x="14" y="16" width="4" height="4" rx="0.5" fill="${warehouseColor}"/>
      </svg>
    </div>`;

  const svgDelivery = `
    <div ${wrapStyle}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
        <path d="M16 0C9.4 0 4 5.4 4 12c0 9 12 28 12 28s12-19 12-28C28 5.4 22.6 0 16 0z"
          fill="${deliveryColor}" ${hasUrgent ? `stroke="#ef4444" stroke-width="2"` : ''}/>
        <circle cx="16" cy="13" r="5" fill="white" opacity="0.9"/>
        <circle cx="16" cy="13" r="3" fill="${deliveryColor}"/>
      </svg>
    </div>`;

  return L.divIcon({
    html: type === 'warehouse' ? svgWarehouse : svgDelivery,
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
  const requests = useAppSelector((s) =>
    s.requests.requests.filter((r) => point.activeRequests.includes(r.id)),
  );
  const isWarehouse = point.type === 'warehouse';

  return (
    <div className="min-w-[220px] max-w-[280px]">
      <div className="flex items-start gap-2 mb-2">
        <div className={`flex size-7 shrink-0 items-center justify-center rounded-md ${isWarehouse ? 'bg-indigo-500/15' : 'bg-primary/15'}`}>
          {isWarehouse
            ? <Warehouse className="size-4 text-indigo-600 dark:text-indigo-400" />
            : <MapPin className="size-4 text-primary" />}
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">{point.name}</p>
          <p className="text-xs text-muted-foreground">{point.address}</p>
        </div>
      </div>

      <Badge variant={isWarehouse ? 'secondary' : 'outline'} className="mb-2 text-xs">
        {isWarehouse ? 'Склад' : 'Точка доставки'}
      </Badge>

      <Separator className="my-2" />
      <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
        <Package className="size-3" /> Запаси
      </p>
      <div className="flex flex-col gap-1 mb-2">
        {point.stock.map((s) => {
          const product = getProductById(s.productId);
          const isBelowThreshold = s.minThreshold !== undefined && s.quantity < s.minThreshold;
          return (
            <div key={s.productId} className="flex items-center justify-between text-xs">
              <span className="text-foreground">{product?.name}</span>
              <span className={isBelowThreshold ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                {s.quantity.toLocaleString()} {product?.unit}{isBelowThreshold && ' ⚠'}
              </span>
            </div>
          );
        })}
      </div>

      {requests.length > 0 && (
        <>
          <Separator className="my-2" />
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Активні запити</p>
          <div className="flex flex-col gap-1">
            {requests.map((r) => {
              const product = getProductById(r.productId);
              return (
                <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-foreground truncate">
                    {product?.name} — {r.quantity} {product?.unit}
                  </span>
                  <CriticalityBadge level={r.criticality} />
                </div>
              );
            })}
          </div>
        </>
      )}

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
  useEffect(() => { setTimeout(() => map.invalidateSize(), 100); }, [map]);
  return null;
}

// ─── Fly-to + open popup on sidebar click ───
function MapController({
  flyToTrigger,
  points,
  markerRefs,
}: {
  flyToTrigger: { id: string; key: number } | null;
  points: MapPoint[];
  markerRefs: React.MutableRefObject<Record<string, L.Marker>>;
}) {
  const map = useMap();
  const prevKey = useRef<number | null>(null);

  useEffect(() => {
    if (!flyToTrigger || flyToTrigger.key === prevKey.current) return;
    prevKey.current = flyToTrigger.key;

    const point = points.find((p) => p.id === flyToTrigger.id);
    if (!point) return;

    const targetZoom = Math.max(map.getZoom(), 15);
    map.flyTo([point.lat, point.lng], targetZoom, { duration: 0.6 });

    setTimeout(() => {
      markerRefs.current[flyToTrigger.id]?.openPopup();
    }, 750);
  }, [flyToTrigger, map, points, markerRefs]);

  return null;
}

function buildRoutePolyline(route: SimRoute, points: MapPoint[]): [number, number][] {
  const wh = points.find((p) => p.id === route.warehouseId);
  const coords: [number, number][] = [];
  if (wh) coords.push([wh.lat, wh.lng]);
  for (const stop of route.stops) {
    const pt = points.find((p) => p.id === stop.pointId);
    if (pt) coords.push([pt.lat, pt.lng]);
  }
  if (wh) coords.push([wh.lat, wh.lng]);
  return coords;
}

// ─── Main component ───
interface MapViewProps {
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  activeRouteIds: string[];
  simulationRoutes?: SimRoute[];
  hoveredPointId?: string | null;
  flyToTrigger?: { id: string; key: number } | null;
}

export function MapView({
  selectedPointId,
  onSelectPoint,
  activeRouteIds,
  simulationRoutes = [],
  hoveredPointId = null,
  flyToTrigger = null,
}: MapViewProps) {
  const center: [number, number] = [49.835, 24.02];
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const points = useAppSelector((s) => s.mapPoints.points);
  const requests = useAppSelector((s) => s.requests.requests);
  const { vehicles, plan } = useAppSelector((s) => s.plan);

  const isSimulating = simulationRoutes.length > 0;

  // Build plan route data for all active IDs
  const planRoutes = activeRouteIds.flatMap((vehicleId) => {
    const route = plan.routes.find((r) => r.vehicleId === vehicleId);
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const wh = vehicle ? points.find((p) => p.id === vehicle.warehouseId) : null;
    if (!route || !wh) return [];

    const color = getVehicleColor(vehicleId, vehicles);
    const coords: [number, number][] = [[wh.lat, wh.lng]];
    const stops: { pointId: string; lat: number; lng: number; order: number; isWarehouse: boolean; color: string }[] = [
      { pointId: wh.id, lat: wh.lat, lng: wh.lng, order: 0, isWarehouse: true, color },
    ];

    route.stops.forEach((stop, idx) => {
      const pt = points.find((p) => p.id === stop.pointId);
      if (pt) {
        coords.push([pt.lat, pt.lng]);
        stops.push({ pointId: pt.id, lat: pt.lat, lng: pt.lng, order: idx + 1, isWarehouse: false, color });
      }
    });
    coords.push([wh.lat, wh.lng]);

    return [{ vehicleId, color, coords, stops }];
  });

  return (
    <MapContainer center={center} zoom={13} className="h-full w-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResizer />
      <MapController flyToTrigger={flyToTrigger} points={points} markerRefs={markerRefs} />

      {/* ── Simulation: all routes ── */}
      {isSimulating && simulationRoutes.map((route) => {
        const coords = buildRoutePolyline(route, points);
        const wh = points.find((p) => p.id === route.warehouseId);
        return (
          <div key={route.vehicleId}>
            {coords.length >= 2 && (
              <Polyline positions={coords} pathOptions={{ color: route.color, weight: 4, opacity: 0.85 }} />
            )}
            {wh && (
              <Marker position={[wh.lat, wh.lng]} icon={createStopNumberIcon(0, route.color, true)} zIndexOffset={1000} />
            )}
            {route.stops.map((stop, idx) => {
              const pt = points.find((p) => p.id === stop.pointId);
              if (!pt) return null;
              return (
                <Marker key={`${route.vehicleId}-${stop.pointId}`} position={[pt.lat, pt.lng]}
                  icon={createStopNumberIcon(idx + 1, route.color, false)} zIndexOffset={1000} />
              );
            })}
          </div>
        );
      })}

      {/* ── Plan tab: multiple active routes ── */}
      {!isSimulating && planRoutes.map(({ vehicleId, color, coords, stops }) => (
        <div key={vehicleId}>
          {coords.length >= 2 && (
            <Polyline positions={coords} pathOptions={{ color, weight: 4, opacity: 0.85 }} />
          )}
          {stops.map((stop) => (
            <Marker
              key={`plan-${vehicleId}-${stop.pointId}`}
              position={[stop.lat, stop.lng]}
              icon={createStopNumberIcon(stop.order, stop.color, stop.isWarehouse)}
              zIndexOffset={1000}
            />
          ))}
        </div>
      ))}

      {/* ── Base markers ── */}
      {points.map((point) => {
        const pointReqs = requests.filter((r) => point.activeRequests.includes(r.id));
        const hasUrgent = pointReqs.some((r) => r.criticality === 'urgent' || r.criticality === 'critical');
        const isHovered = hoveredPointId === point.id;
        return (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={createPointIcon(point.type, hasUrgent, isHovered)}
            ref={(m: L.Marker | null) => {
              if (m) markerRefs.current[point.id] = m;
              else delete markerRefs.current[point.id];
            }}
            eventHandlers={{ click: () => onSelectPoint(selectedPointId === point.id ? null : point.id) }}
          >
            <Popup><PointPopup point={point} /></Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
