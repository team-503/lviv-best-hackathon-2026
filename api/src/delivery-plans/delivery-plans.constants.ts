import { CriticalityLevel } from '../common/enums/criticality-level.enum';

export const EARTH_RADIUS_M = 6_371_000;

export const VEHICLE_COUNT = 5;
export const VEHICLE_CAPACITY = 100;

export const CRITICALITY_WEIGHT: Record<string, number> = {
  [CriticalityLevel.Urgent]: 5,
  [CriticalityLevel.Critical]: 4,
  [CriticalityLevel.High]: 3,
  [CriticalityLevel.Medium]: 2,
  [CriticalityLevel.Normal]: 1,
};

export const URGENT_CRITICALITIES = [CriticalityLevel.Urgent, CriticalityLevel.Critical];
export const STANDARD_CRITICALITIES = [CriticalityLevel.High, CriticalityLevel.Medium, CriticalityLevel.Normal];
