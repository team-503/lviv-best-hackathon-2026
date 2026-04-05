import { Injectable } from '@nestjs/common';
import { LocationType } from '../common/enums/location-type.enum';
import { PlanStatus } from '../common/enums/plan-status.enum';
import { PlanType } from '../common/enums/plan-type.enum';
import { RequestStatus } from '../common/enums/request-status.enum';
import { SimulationStatus } from '../common/enums/simulation-status.enum';
import { StopAction } from '../common/enums/stop-action.enum';
import { STANDARD_CRITICALITIES, URGENT_CRITICALITIES } from '../delivery-plans/constants';
import { toPlanWithRoutes } from '../delivery-plans/delivery-plans.helper';
import { DeliveryPlansService } from '../delivery-plans/delivery-plans.service';
import type { PlanWithRoutesResponseDto } from '../delivery-plans/dto/response/plan-with-routes.response.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { SimulationAdvanceResponseDto } from './dto/response/simulation-advance.response.dto';
import type { SimulationStatusResponseDto } from './dto/response/simulation-status.response.dto';
import { computeTransition } from './simulation.helper';
import type { SimulationState } from './types/simulation-state.type';

@Injectable()
export class SimulationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deliveryPlansService: DeliveryPlansService,
  ) {}

  async getStatus(): Promise<SimulationStatusResponseDto> {
    const state = await this.loadState();
    return { status: state.status, day: state.day };
  }

  async advance(): Promise<SimulationAdvanceResponseDto> {
    const state = await this.loadState();
    const transition = computeTransition(state);

    let executedPlan: PlanWithRoutesResponseDto | null = null;

    if (transition.planTypeToExecute !== null) {
      executedPlan = await this.executePlan(transition.planTypeToExecute);
    }

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

  private async loadState(): Promise<SimulationState> {
    const row = await this.prisma.simulation_state.findUnique({ where: { id: 1 } });
    return {
      status: (row?.status as SimulationStatus) ?? SimulationStatus.Idle,
      day: row?.day ?? 1,
    };
  }

  private async executePlan(planType: PlanType): Promise<PlanWithRoutesResponseDto | null> {
    const criticalities = planType === PlanType.Urgent ? URGENT_CRITICALITIES : STANDARD_CRITICALITIES;

    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.delivery_plans.findFirst({
        where: { type: planType, status: PlanStatus.Draft },
        orderBy: { created_at: 'desc' },
      });

      if (!plan) {
        return null;
      }

      const stops = await tx.route_stops.findMany({
        where: { plan_routes: { plan_id: plan.id } },
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

      const rows = await this.deliveryPlansService.fetchPlanRouteStops(plan.id);

      return toPlanWithRoutes({ id: plan.id, type: plan.type, status: PlanStatus.Completed, created_at: plan.created_at }, rows);
    });
  }
}
