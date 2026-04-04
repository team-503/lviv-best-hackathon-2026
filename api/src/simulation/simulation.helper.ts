import { PlanType } from '../common/enums/plan-type.enum';
import { SimulationStatus } from '../common/enums/simulation-status.enum';
import type { SimulationState } from './types/simulation-state.type';
import type { TransitionResult } from './types/transition-result.type';

export function computeTransition(state: SimulationState): TransitionResult {
  switch (state.status) {
    case SimulationStatus.Idle:
      return {
        previousStatus: SimulationStatus.Idle,
        newStatus: SimulationStatus.Stage1,
        planTypeToExecute: PlanType.Urgent,
        incrementDay: false,
      };
    case SimulationStatus.Stage1:
      return {
        previousStatus: SimulationStatus.Stage1,
        newStatus: SimulationStatus.Stage2,
        planTypeToExecute: PlanType.Standard,
        incrementDay: false,
      };
    case SimulationStatus.Stage2:
      return {
        previousStatus: SimulationStatus.Stage2,
        newStatus: SimulationStatus.Idle,
        planTypeToExecute: null,
        incrementDay: true,
      };
  }
}
