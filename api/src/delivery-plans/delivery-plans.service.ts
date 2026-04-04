import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type location_type, type stop_action } from '@prisma/client';
import { LocationType } from '../common/enums/location-type.enum';
import { PlanStatus } from '../common/enums/plan-status.enum';
import { PlanType } from '../common/enums/plan-type.enum';
import { RequestStatus } from '../common/enums/request-status.enum';
import { StopAction } from '../common/enums/stop-action.enum';
import { GeoService } from '../geo/geo.service';
import { PrismaService } from '../prisma/prisma.service';
import { CRITICALITY_WEIGHT, STANDARD_CRITICALITIES, URGENT_CRITICALITIES, VEHICLE_CAPACITY, VEHICLE_COUNT } from './constants';
import {
  assignRequestsToVehicles,
  checkDeficits,
  optimizeRouteOrder,
  sortRequests,
  toPlanWithRoutes,
} from './delivery-plans.helper';
import type { CurrentPlansResponseDto } from './dto/response/current-plans.response.dto';
import type { PlanListItemResponseDto } from './dto/response/plan-list-item.response.dto';
import type { PlanWithRoutesResponseDto } from './dto/response/plan-with-routes.response.dto';
import type { DeliveryRequestRow } from './types/delivery-request-row.type';
import type { PlanRouteStopRow } from './types/plan-route-stop-row.type';
import type { SortedRequest } from './types/sorted-request.type';
import type { SourceMatch } from './types/source-match.type';
import type { VehicleState } from './types/vehicle-state.type';
import type { WarehouseLocationRow } from './types/warehouse-location-row.type';

@Injectable()
export class DeliveryPlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geoService: GeoService,
  ) {}

  async findCurrent(): Promise<CurrentPlansResponseDto> {
    const [urgentPlan, standardPlan] = await Promise.all([
      this.findLatestPlanByType(PlanType.Urgent),
      this.findLatestPlanByType(PlanType.Standard),
    ]);

    return { urgent: urgentPlan, standard: standardPlan };
  }

  async findHistory(): Promise<PlanListItemResponseDto[]> {
    const plans = await this.prisma.delivery_plans.findMany({
      where: { status: PlanStatus.Completed },
      orderBy: { created_at: 'desc' },
    });

    return plans.map((p) => ({
      id: p.id,
      type: p.type,
      status: p.status,
      createdAt: p.created_at,
    }));
  }

  async findOne(id: number): Promise<PlanWithRoutesResponseDto> {
    const plan = await this.prisma.delivery_plans.findUnique({ where: { id } });

    if (!plan) {
      throw new NotFoundException('Delivery plan not found');
    }

    const rows = await this.fetchPlanRouteStops(plan.id);
    return toPlanWithRoutes({ id: plan.id, type: plan.type, status: plan.status, created_at: plan.created_at }, rows);
  }

  async recalculateAll(): Promise<void> {
    await Promise.all([this.recalculate(PlanType.Urgent), this.recalculate(PlanType.Standard)]);
  }

  async recalculate(planType: PlanType): Promise<void> {
    const criticalities = planType === PlanType.Urgent ? URGENT_CRITICALITIES : STANDARD_CRITICALITIES;

    const rawRequests = await this.fetchActiveRequests(criticalities);
    if (rawRequests.length === 0) {
      await this.savePlan(planType, []);
      return;
    }

    const sorted = sortRequests(
      rawRequests.map((r) => ({
        requestId: r.id,
        pointId: r.point_id,
        pointName: r.point_name,
        pointLat: Number(r.lat),
        pointLng: Number(r.lng),
        productId: r.product_id,
        productName: r.product_name,
        quantity: r.quantity,
        criticality: r.criticality,
        criticalityWeight: CRITICALITY_WEIGHT[r.criticality] ?? 0,
      })),
    );

    const sources = await this.findSourcesForRequests(sorted);

    const warehouses = await this.fetchWarehouseLocations();
    if (warehouses.length === 0) {
      await this.savePlan(planType, []);
      return;
    }

    const vehicles = assignRequestsToVehicles(sorted, sources, VEHICLE_COUNT, VEHICLE_CAPACITY, warehouses);

    for (const vehicle of vehicles) {
      vehicle.stops = optimizeRouteOrder(vehicle);
    }

    await this.resolveDeficits(vehicles);
    await this.savePlan(planType, vehicles);
  }

  private async fetchActiveRequests(criticalities: string[]): Promise<DeliveryRequestRow[]> {
    return this.prisma.$queryRaw<DeliveryRequestRow[]>`
      SELECT
        dr.id,
        dr.point_id,
        pt.name AS point_name,
        ST_Y(pt.location::geometry) AS lat,
        ST_X(pt.location::geometry) AS lng,
        dr.product_id,
        p.name AS product_name,
        dr.quantity,
        dr.criticality::text AS criticality
      FROM delivery_requests dr
      JOIN points pt ON pt.id = dr.point_id
      JOIN products p ON p.id = dr.product_id
      WHERE dr.status = ${RequestStatus.Active}
        AND dr.criticality::text IN (${Prisma.join(criticalities)})
    `;
  }

  private async findSourcesForRequests(requests: SortedRequest[]): Promise<Map<number, SourceMatch>> {
    const sources = new Map<number, SourceMatch>();

    // Batch warehouse lookups by productId to avoid N+1
    const productIds = [...new Set(requests.map((r) => r.productId))];
    const warehousesByProduct = new Map<number, Awaited<ReturnType<GeoService['findNearestWarehousesWithProduct']>>>();

    await Promise.all(
      productIds.map(async (productId) => {
        const nearest = requests.find((r) => r.productId === productId)!;
        const result = await this.geoService.findNearestWarehousesWithProduct(nearest.pointLat, nearest.pointLng, productId, 50);
        warehousesByProduct.set(productId, result);
      }),
    );

    for (const request of requests) {
      const warehouses = warehousesByProduct.get(request.productId) ?? [];
      if (warehouses.length > 0) {
        const w = warehouses[0];
        sources.set(request.requestId, {
          locationType: LocationType.Warehouse,
          locationId: w.id,
          locationName: w.name,
          lat: w.location.lat,
          lng: w.location.lng,
          availableQuantity: w.quantity,
        });
        continue;
      }

      const points = await this.geoService.findNearestPointsWithSurplus(
        request.pointLat,
        request.pointLng,
        request.productId,
        request.quantity,
        10,
      );

      if (points.length > 0) {
        const bestPoint = points.reduce((best, p) => (p.surplus > best.surplus ? p : best), points[0]);
        sources.set(request.requestId, {
          locationType: LocationType.Point,
          locationId: bestPoint.id,
          locationName: bestPoint.name,
          lat: bestPoint.location.lat,
          lng: bestPoint.location.lng,
          availableQuantity: bestPoint.surplus,
        });
      }
    }

    return sources;
  }

  private async fetchWarehouseLocations(): Promise<WarehouseLocationRow[]> {
    return this.prisma.$queryRaw<WarehouseLocationRow[]>`
      SELECT
        id,
        name,
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lng
      FROM warehouses
      ORDER BY id
    `;
  }

  private async resolveDeficits(vehicles: VehicleState[]): Promise<void> {
    const pointIds = new Set<number>();
    for (const v of vehicles) {
      for (const s of v.stops) {
        if (s.action === StopAction.Pickup && s.locationType === LocationType.Point && s.pointId) {
          pointIds.add(s.pointId);
        }
      }
    }

    if (pointIds.size === 0) return;

    const pointStock = await this.prisma.point_stock.findMany({
      where: { point_id: { in: [...pointIds] } },
    });

    const stockMap = new Map<string, { quantity: number; minThreshold: number }>();
    for (const ps of pointStock) {
      stockMap.set(`${ps.point_id}:${ps.product_id}`, {
        quantity: ps.quantity,
        minThreshold: ps.min_threshold,
      });
    }

    const deficits = checkDeficits(vehicles, stockMap);
    if (deficits.length === 0) return;

    // Batch warehouse lookups for all deficit product IDs
    const deficitProductIds = [...new Set(deficits.map((d) => d.productId))];
    const warehouseCache = new Map<number, Awaited<ReturnType<GeoService['findNearestWarehousesWithProduct']>>>();

    await Promise.all(
      deficitProductIds.map(async (productId) => {
        const result = await this.geoService.findNearestWarehousesWithProduct(0, 0, productId, 50);
        warehouseCache.set(productId, result);
      }),
    );

    for (const deficit of deficits) {
      const warehouses = warehouseCache.get(deficit.productId) ?? [];
      if (warehouses.length === 0) continue;

      const w = warehouses[0];
      for (const v of vehicles) {
        for (let i = 0; i < v.stops.length; i++) {
          const stop = v.stops[i];
          if (
            stop.action === StopAction.Pickup &&
            stop.locationType === LocationType.Point &&
            stop.pointId === deficit.pointId &&
            stop.productId === deficit.productId
          ) {
            v.stops[i] = {
              ...stop,
              locationType: LocationType.Warehouse,
              warehouseId: w.id,
              pointId: null,
              lat: w.location.lat,
              lng: w.location.lng,
            };
          }
        }
      }
    }
  }

  private async savePlan(planType: PlanType, vehicles: VehicleState[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await this.deleteOldDraftPlans(tx, planType);

      const plan = await tx.delivery_plans.create({
        data: { type: planType, status: PlanStatus.Draft },
      });

      for (const vehicle of vehicles) {
        const validStops = vehicle.stops.filter((s) => s.productId > 0);
        if (validStops.length === 0) continue;

        const route = await tx.plan_routes.create({
          data: { plan_id: plan.id, vehicle_number: vehicle.vehicleNumber },
        });

        await tx.route_stops.createMany({
          data: validStops.map((s) => ({
            route_id: route.id,
            stop_order: s.stopOrder,
            location_type: s.locationType as location_type,
            warehouse_id: s.warehouseId,
            point_id: s.pointId,
            product_id: s.productId,
            quantity: s.quantity,
            action: s.action as stop_action,
          })),
        });
      }
    });
  }

  private async deleteOldDraftPlans(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    planType: PlanType,
  ): Promise<void> {
    const oldPlans = await tx.delivery_plans.findMany({
      where: { type: planType, status: PlanStatus.Draft },
      select: { id: true },
    });

    if (oldPlans.length > 0) {
      const oldPlanIds = oldPlans.map((p) => p.id);
      await tx.route_stops.deleteMany({
        where: { plan_routes: { plan_id: { in: oldPlanIds } } },
      });
      await tx.plan_routes.deleteMany({
        where: { plan_id: { in: oldPlanIds } },
      });
      await tx.delivery_plans.deleteMany({
        where: { id: { in: oldPlanIds } },
      });
    }
  }

  private async findLatestPlanByType(planType: PlanType): Promise<PlanWithRoutesResponseDto | null> {
    const plan = await this.prisma.delivery_plans.findFirst({
      where: {
        type: planType,
        status: { in: [PlanStatus.Draft, PlanStatus.Executing] },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!plan) return null;

    const rows = await this.fetchPlanRouteStops(plan.id);
    return toPlanWithRoutes({ id: plan.id, type: plan.type, status: plan.status, created_at: plan.created_at }, rows);
  }

  async fetchPlanRouteStops(planId: number): Promise<PlanRouteStopRow[]> {
    return this.prisma.$queryRaw<PlanRouteStopRow[]>`
      SELECT
        pr.id AS route_id,
        pr.vehicle_number,
        rs.id AS stop_id,
        rs.stop_order,
        rs.location_type::text,
        rs.warehouse_id,
        rs.point_id,
        rs.product_id,
        rs.quantity,
        rs.action::text,
        COALESCE(w.name, pt.name) AS location_name,
        COALESCE(ST_Y(w.location::geometry), ST_Y(pt.location::geometry)) AS lat,
        COALESCE(ST_X(w.location::geometry), ST_X(pt.location::geometry)) AS lng,
        p.name AS product_name
      FROM plan_routes pr
      JOIN route_stops rs ON rs.route_id = pr.id
      LEFT JOIN warehouses w ON rs.location_type = 'warehouse' AND w.id = rs.warehouse_id
      LEFT JOIN points pt ON rs.location_type = 'point' AND pt.id = rs.point_id
      JOIN products p ON p.id = rs.product_id
      WHERE pr.plan_id = ${planId}
      ORDER BY pr.vehicle_number, rs.stop_order
    `;
  }
}
