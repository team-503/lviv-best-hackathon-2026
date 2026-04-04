import { BadRequestException, Injectable } from '@nestjs/common';
import { LocationType } from '../common/enums/location-type.enum';
import { PlanStatus } from '../common/enums/plan-status.enum';
import { PlanType } from '../common/enums/plan-type.enum';
import { RequestStatus } from '../common/enums/request-status.enum';
import { SimulationStatus } from '../common/enums/simulation-status.enum';
import { StopAction } from '../common/enums/stop-action.enum';
import { STANDARD_CRITICALITIES, URGENT_CRITICALITIES } from '../delivery-plans/constants';
import { toPlanWithRoutes } from '../delivery-plans/delivery-plans.helper';
import type { PlanWithRoutesResponseDto } from '../delivery-plans/dto/response/plan-with-routes.response.dto';
import type { PlanRouteStopRow } from '../delivery-plans/types/plan-route-stop-row.type';
import { PrismaService } from '../prisma/prisma.service';
import type { SimulationAdvanceResponseDto } from './dto/response/simulation-advance.response.dto';
import type { SimulationStatusResponseDto } from './dto/response/simulation-status.response.dto';
import { computeTransition } from './simulation.helper';
import type { SimulationState } from './types/simulation-state.type';

@Injectable()
export class SimulationService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(): Promise<SimulationStatusResponseDto> {
    const state = await this.loadState();
    return { status: state.status as SimulationStatus, day: state.day };
  }

  async advance(): Promise<SimulationAdvanceResponseDto> {
    const row = await this.loadState();
    const state: SimulationState = { status: row.status as SimulationStatus, day: row.day };
    const transition = computeTransition(state);

    const executedPlan: PlanWithRoutesResponseDto | null =
      transition.planTypeToExecute !== null ? await this.executePlan(transition.planTypeToExecute) : null;
    const newDay = transition.incrementDay ? state.day + 1 : state.day;

    await this.prisma.simulation_state.update({
      where: { id: 1 },
      data: { status: transition.newStatus, day: newDay },
    });

    return {
      previousStatus: transition.previousStatus,
      newStatus: transition.newStatus,
      day: newDay,
      executedPlan,
    };
  }

  private async loadState(): Promise<{ status: string; day: number }> {
    const row = await this.prisma.simulation_state.findUnique({ where: { id: 1 } });
    return row ?? { status: SimulationStatus.Idle, day: 1 };
  }

  private async executePlan(planType: PlanType): Promise<PlanWithRoutesResponseDto> {
    const criticalities = planType === PlanType.Urgent ? URGENT_CRITICALITIES : STANDARD_CRITICALITIES;

    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.delivery_plans.findFirst({
        where: { type: planType, status: PlanStatus.Draft },
        orderBy: { created_at: 'desc' },
      });

      if (!plan) {
        throw new BadRequestException(`No draft ${planType} plan available to execute`);
      }

      await tx.delivery_plans.update({
        where: { id: plan.id },
        data: { status: PlanStatus.Executing },
      });

      const stops = await tx.route_stops.findMany({
        where: { plan_routes: { plan_id: plan.id } },
        include: { plan_routes: true },
      });

      for (const stop of stops) {
        if (stop.action === StopAction.Pickup && stop.location_type === LocationType.Warehouse && stop.warehouse_id !== null) {
          await tx.warehouse_stock.update({
            where: {
              warehouse_id_product_id: {
                warehouse_id: stop.warehouse_id,
                product_id: stop.product_id,
              },
            },
            data: { quantity: { decrement: stop.quantity } },
          });
        } else if (stop.action === StopAction.Pickup && stop.location_type === LocationType.Point && stop.point_id !== null) {
          await tx.point_stock.update({
            where: {
              point_id_product_id: {
                point_id: stop.point_id,
                product_id: stop.product_id,
              },
            },
            data: { quantity: { decrement: stop.quantity } },
          });
        } else if (stop.action === StopAction.Deliver && stop.point_id !== null) {
          await tx.point_stock.upsert({
            where: {
              point_id_product_id: {
                point_id: stop.point_id,
                product_id: stop.product_id,
              },
            },
            update: { quantity: { increment: stop.quantity } },
            create: {
              point_id: stop.point_id,
              product_id: stop.product_id,
              quantity: stop.quantity,
              min_threshold: 0,
            },
          });
        }
      }

      await tx.delivery_plans.update({
        where: { id: plan.id },
        data: { status: PlanStatus.Completed },
      });

      await tx.delivery_requests.updateMany({
        where: {
          status: RequestStatus.Active,
          criticality: { in: criticalities },
        },
        data: { status: RequestStatus.Completed },
      });

      const rows = await tx.$queryRaw<PlanRouteStopRow[]>`
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
        WHERE pr.plan_id = ${plan.id}
        ORDER BY pr.vehicle_number, rs.stop_order
      `;

      return toPlanWithRoutes({ id: plan.id, type: plan.type, status: PlanStatus.Completed, created_at: plan.created_at }, rows);
    });
  }
}
