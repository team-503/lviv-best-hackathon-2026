import { api } from '../api';
import type { SimulationStatusResponseDto, SimulationAdvanceResponseDto } from '@/types/api';

export function getSimulationStatus(): Promise<SimulationStatusResponseDto> {
  return api.get('/simulation/status');
}

export function advanceSimulation(): Promise<SimulationAdvanceResponseDto> {
  return api.post('/simulation/advance', {});
}
