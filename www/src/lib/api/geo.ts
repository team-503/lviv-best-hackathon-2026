import { api } from '../api';
import type { ProductNearestLocationsResponseDto } from '@/types/api';

export function getNearestForPoint(pointId: number): Promise<ProductNearestLocationsResponseDto[]> {
  return api.get(`/geo/nearest-for-point/${pointId}`);
}
