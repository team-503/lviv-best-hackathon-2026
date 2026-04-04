import type { PlanStop } from './plan-stop.type';

export interface VehicleState {
  vehicleNumber: number;
  currentLat: number;
  currentLng: number;
  remainingCapacity: number;
  stops: PlanStop[];
}
