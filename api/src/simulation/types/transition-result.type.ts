import type { PlanType } from '../../common/enums/plan-type.enum';
import type { SimulationStatus } from '../../common/enums/simulation-status.enum';

export interface TransitionResult {
  previousStatus: SimulationStatus;
  newStatus: SimulationStatus;
  planTypeToExecute: PlanType | null;
  incrementDay: boolean;
}
