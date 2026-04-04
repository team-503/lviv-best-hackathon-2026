import { LocationType } from '../common/enums/location-type.enum';
import { StopAction } from '../common/enums/stop-action.enum';
import { EARTH_RADIUS_M } from './constants';
import type { PlanWithRoutesResponseDto } from './dto/response/plan-with-routes.response.dto';
import type { RouteStopResponseDto } from './dto/response/route-stop.response.dto';
import type { RouteResponseDto } from './dto/response/route.response.dto';
import type { PlanRouteStopRow } from './types/plan-route-stop-row.type';
import type { PlanStop } from './types/plan-stop.type';
import type { SortedRequest } from './types/sorted-request.type';
import type { SourceMatch } from './types/source-match.type';
import type { VehicleState } from './types/vehicle-state.type';
import type { WarehouseLocationRow } from './types/warehouse-location-row.type';

export function sortRequests(requests: SortedRequest[]): SortedRequest[] {
  return [...requests].sort((a, b) => {
    if (b.criticalityWeight !== a.criticalityWeight) {
      return b.criticalityWeight - a.criticalityWeight;
    }
    return b.quantity - a.quantity;
  });
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestVehicle(vehicles: VehicleState[], lat: number, lng: number, minCapacity: number): VehicleState | null {
  let nearest: VehicleState | null = null;
  let minDist = Infinity;

  for (const v of vehicles) {
    if (v.remainingCapacity < minCapacity) continue;
    const dist = haversineDistance(v.currentLat, v.currentLng, lat, lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = v;
    }
  }

  return nearest;
}

function findNearestWarehouse(lat: number, lng: number, warehouses: WarehouseLocationRow[]): WarehouseLocationRow {
  let nearest = warehouses[0];
  let minDist = Infinity;

  for (const w of warehouses) {
    const dist = haversineDistance(lat, lng, w.lat, w.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = w;
    }
  }

  return nearest;
}

export function assignRequestsToVehicles(
  sortedRequests: SortedRequest[],
  sources: Map<number, SourceMatch>,
  vehicleCount: number,
  vehicleCapacity: number,
  warehouses: WarehouseLocationRow[],
): VehicleState[] {
  const startWarehouse = warehouses[0];
  const vehicles: VehicleState[] = Array.from({ length: vehicleCount }, (_, i) => ({
    vehicleNumber: i + 1,
    currentLat: startWarehouse.lat,
    currentLng: startWarehouse.lng,
    remainingCapacity: vehicleCapacity,
    stops: [],
  }));

  for (const request of sortedRequests) {
    const source = sources.get(request.requestId);
    if (!source) continue;

    if (request.quantity > vehicleCapacity) continue;

    let vehicle = findNearestVehicle(vehicles, source.lat, source.lng, request.quantity);

    if (!vehicle) {
      const vehicleToReload = findNearestVehicleForReload(vehicles, warehouses);
      if (!vehicleToReload) continue;

      const nearestWh = findNearestWarehouse(vehicleToReload.vehicle.currentLat, vehicleToReload.vehicle.currentLng, warehouses);

      vehicleToReload.vehicle.stops.push({
        stopOrder: vehicleToReload.vehicle.stops.length + 1,
        locationType: LocationType.Warehouse,
        warehouseId: nearestWh.id,
        pointId: null,
        productId: 0,
        quantity: 0,
        action: StopAction.Pickup,
        lat: nearestWh.lat,
        lng: nearestWh.lng,
      });

      vehicleToReload.vehicle.currentLat = nearestWh.lat;
      vehicleToReload.vehicle.currentLng = nearestWh.lng;
      vehicleToReload.vehicle.remainingCapacity = vehicleCapacity;

      vehicle = findNearestVehicle(vehicles, source.lat, source.lng, request.quantity);
      if (!vehicle) continue;
    }

    vehicle.stops.push({
      stopOrder: vehicle.stops.length + 1,
      locationType: source.locationType,
      warehouseId: source.locationType === LocationType.Warehouse ? source.locationId : null,
      pointId: source.locationType === LocationType.Point ? source.locationId : null,
      productId: request.productId,
      quantity: request.quantity,
      action: StopAction.Pickup,
      lat: source.lat,
      lng: source.lng,
    });

    vehicle.stops.push({
      stopOrder: vehicle.stops.length + 1,
      locationType: LocationType.Point,
      warehouseId: null,
      pointId: request.pointId,
      productId: request.productId,
      quantity: request.quantity,
      action: StopAction.Deliver,
      lat: request.pointLat,
      lng: request.pointLng,
    });

    vehicle.remainingCapacity -= request.quantity;
    vehicle.currentLat = request.pointLat;
    vehicle.currentLng = request.pointLng;
  }

  return vehicles;
}

function findNearestVehicleForReload(
  vehicles: VehicleState[],
  warehouses: WarehouseLocationRow[],
): { vehicle: VehicleState; distance: number } | null {
  let best: { vehicle: VehicleState; distance: number } | null = null;

  for (const v of vehicles) {
    const nearestWh = findNearestWarehouse(v.currentLat, v.currentLng, warehouses);
    const dist = haversineDistance(v.currentLat, v.currentLng, nearestWh.lat, nearestWh.lng);
    if (!best || dist < best.distance) {
      best = { vehicle: v, distance: dist };
    }
  }

  return best;
}

export function optimizeRouteOrder(vehicle: VehicleState): PlanStop[] {
  if (vehicle.stops.length <= 2) return vehicle.stops;

  const pairs: { pickup: PlanStop; deliver: PlanStop }[] = [];
  for (let i = 0; i < vehicle.stops.length; i += 2) {
    const pickup = vehicle.stops[i];
    const deliver = vehicle.stops[i + 1];
    if (pickup && deliver) {
      pairs.push({ pickup, deliver });
    }
  }

  if (pairs.length <= 1) return vehicle.stops;

  const ordered: { pickup: PlanStop; deliver: PlanStop }[] = [];
  const remaining = [...pairs];
  let currentLat = vehicle.stops[0].lat;
  let currentLng = vehicle.stops[0].lng;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineDistance(currentLat, currentLng, remaining[i].deliver.lat, remaining[i].deliver.lng);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }

    const pair = remaining.splice(nearestIdx, 1)[0];
    ordered.push(pair);
    currentLat = pair.deliver.lat;
    currentLng = pair.deliver.lng;
  }

  const result: PlanStop[] = [];
  let order = 1;
  for (const pair of ordered) {
    result.push({ ...pair.pickup, stopOrder: order++ });
    result.push({ ...pair.deliver, stopOrder: order++ });
  }

  return result;
}

export interface DeficitInfo {
  pointId: number;
  productId: number;
}

export function checkDeficits(
  vehicles: VehicleState[],
  pointStockMap: Map<string, { quantity: number; minThreshold: number }>,
): DeficitInfo[] {
  const pointPickups = new Map<string, number>();

  for (const v of vehicles) {
    for (const stop of v.stops) {
      if (stop.action === StopAction.Pickup && stop.locationType === LocationType.Point && stop.pointId) {
        const key = `${stop.pointId}:${stop.productId}`;
        pointPickups.set(key, (pointPickups.get(key) ?? 0) + stop.quantity);
      }
    }
  }

  const deficits: DeficitInfo[] = [];

  for (const [key, totalPickup] of pointPickups) {
    const [pointIdStr, productIdStr] = key.split(':');
    const stock = pointStockMap.get(key);
    if (!stock) continue;

    if (stock.quantity - totalPickup < stock.minThreshold) {
      deficits.push({
        pointId: Number(pointIdStr),
        productId: Number(productIdStr),
      });
    }
  }

  return deficits;
}

export function toPlanWithRoutes(
  plan: { id: number; type: string; status: string; created_at: Date },
  rows: PlanRouteStopRow[],
): PlanWithRoutesResponseDto {
  const routeMap = new Map<number, RouteResponseDto>();

  for (const row of rows) {
    if (!routeMap.has(row.route_id)) {
      routeMap.set(row.route_id, {
        id: row.route_id,
        vehicleNumber: row.vehicle_number,
        stops: [],
      });
    }

    const stop: RouteStopResponseDto = {
      order: row.stop_order,
      locationType: row.location_type,
      location: {
        id: (row.warehouse_id ?? row.point_id)!,
        name: row.location_name,
        lat: Number(row.lat),
        lng: Number(row.lng),
      },
      product: {
        id: row.product_id,
        name: row.product_name,
      },
      quantity: row.quantity,
      action: row.action,
    };

    routeMap.get(row.route_id)!.stops.push(stop);
  }

  return {
    id: plan.id,
    type: plan.type,
    status: plan.status,
    createdAt: plan.created_at,
    routes: [...routeMap.values()],
  };
}
