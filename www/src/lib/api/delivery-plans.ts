import { api } from '../api';
import type { CurrentPlansResponseDto, PlanDetailResponseDto, PlanListItemResponseDto } from '@/types/api';

export function getCurrentPlans(): Promise<CurrentPlansResponseDto> {
  return api.get('/delivery-plans/current');
}

export function getPlanHistory(): Promise<PlanListItemResponseDto[]> {
  return api.get('/delivery-plans/history');
}

export function getPlan(id: number): Promise<PlanDetailResponseDto> {
  return api.get(`/delivery-plans/${id}`);
}
