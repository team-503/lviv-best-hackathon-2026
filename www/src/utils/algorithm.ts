import type { CriticalityLevel, DeliveryRequest, Vehicle } from '@/data/mockData';

/** Minimal map point used by the simulation algorithm (lat/lng + type). */
export interface AlgoMapPoint {
  id: string;
  name: string;
  type: 'warehouse' | 'delivery' | 'point';
  lat: number;
  lng: number;
}

// ─── Haversine distance (km) ───
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Priority ───
const PRIORITY: Record<CriticalityLevel, number> = {
  urgent: 5,
  critical: 4,
  high: 3,
  medium: 2,
  normal: 1,
};

// ─── Types ───
export interface SimStopItem {
  requestId: string;
  productId: string;
  quantity: number;
  sourceWarehouseId: string;
}

export interface SimStop {
  pointId: string;
  items: SimStopItem[];
}

export interface SimRoute {
  vehicleId: string;
  warehouseId: string;
  color: string;
  stops: SimStop[];
}

const ROUTE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

// ─── Nearest-neighbor TSP ───
function nearestNeighborOrder(stops: SimStop[], startLat: number, startLng: number, points: AlgoMapPoint[]): SimStop[] {
  if (stops.length <= 1) return stops;
  const remaining = [...stops];
  const ordered: SimStop[] = [];
  let curLat = startLat;
  let curLng = startLng;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const pt = points.find((p) => p.id === remaining[i].pointId);
      if (!pt) continue;
      const d = haversine(curLat, curLng, pt.lat, pt.lng);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const chosen = remaining.splice(bestIdx, 1)[0];
    ordered.push(chosen);
    const chosenPt = points.find((p) => p.id === chosen.pointId);
    if (chosenPt) {
      curLat = chosenPt.lat;
      curLng = chosenPt.lng;
    }
  }
  return ordered;
}

// ─── Main algorithm ───
export function generateRoutes(requests: DeliveryRequest[], points: AlgoMapPoint[], vehicles: Vehicle[]): SimRoute[] {
  if (requests.length === 0 || vehicles.length === 0) return [];

  // 1. Sort requests: criticality desc, then quantity desc
  const sorted = [...requests].sort((a, b) => {
    const pDiff = PRIORITY[b.criticality] - PRIORITY[a.criticality];
    return pDiff !== 0 ? pDiff : b.quantity - a.quantity;
  });

  // 2. Init vehicle state
  const vehicleState = vehicles.map((v, idx) => {
    const wh = points.find((p) => p.id === v.warehouseId);
    return {
      vehicleId: v.id,
      warehouseId: v.warehouseId,
      color: ROUTE_COLORS[idx % ROUTE_COLORS.length],
      capacity: v.capacity,
      used: 0,
      stops: [] as SimStop[],
      curLat: wh?.lat ?? 0,
      curLng: wh?.lng ?? 0,
    };
  });

  // 3. Greedy assignment — pick nearest warehouse by distance
  for (const req of sorted) {
    const dest = points.find((p) => p.id === req.pointId);
    if (!dest) continue;

    // Find nearest warehouse to destination
    const warehouses = points.filter((p) => p.type === 'warehouse');
    if (warehouses.length === 0) continue;

    const sourceWarehouseId = warehouses.reduce((bestId, wh) => {
      const bestWh = points.find((p) => p.id === bestId)!;
      const dBest = haversine(dest.lat, dest.lng, bestWh.lat, bestWh.lng);
      const dCur = haversine(dest.lat, dest.lng, wh.lat, wh.lng);
      return dCur < dBest ? wh.id : bestId;
    }, warehouses[0].id);

    // Find vehicle with capacity closest to destination
    const eligible = vehicleState.filter((v) => v.capacity - v.used >= req.quantity);
    if (eligible.length === 0) continue;

    const vehicle = eligible.reduce((best, v) => {
      const da = haversine(v.curLat, v.curLng, dest.lat, dest.lng);
      const db = haversine(best.curLat, best.curLng, dest.lat, dest.lng);
      return da < db ? v : best;
    });

    // Add stop to vehicle
    const existing = vehicle.stops.find((s) => s.pointId === req.pointId);
    const item: SimStopItem = {
      requestId: req.id,
      productId: req.productId,
      quantity: req.quantity,
      sourceWarehouseId,
    };
    if (existing) {
      existing.items.push(item);
    } else {
      vehicle.stops.push({ pointId: req.pointId, items: [item] });
    }

    vehicle.used += req.quantity;
    vehicle.curLat = dest.lat;
    vehicle.curLng = dest.lng;
  }

  // 4. Apply nearest-neighbor TSP per vehicle + build result
  return vehicleState
    .filter((v) => v.stops.length > 0)
    .map((v) => {
      const wh = points.find((p) => p.id === v.warehouseId);
      return {
        vehicleId: v.vehicleId,
        warehouseId: v.warehouseId,
        color: v.color,
        stops: nearestNeighborOrder(v.stops, wh?.lat ?? 0, wh?.lng ?? 0, points),
      };
    });
}
