import type { SimulationStatus } from '../../common/enums/simulation-status.enum';

export interface SimulationState {
  status: SimulationStatus;
  day: number;
}
