import { api } from '../api';
import type { DeliveryRequestResponseDto } from '@/types/api';

export function createDeliveryRequest(
  pointId: number,
  data: { productId: number; quantity: number; criticality: string },
): Promise<DeliveryRequestResponseDto> {
  return api.post(`/points/${pointId}/delivery-requests`, data);
}

export function updateDeliveryRequest(
  pointId: number,
  requestId: number,
  data: { productId?: number; quantity?: number; criticality?: string },
): Promise<DeliveryRequestResponseDto> {
  return api.put(`/points/${pointId}/delivery-requests/${requestId}`, data);
}

export function deleteDeliveryRequest(pointId: number, requestId: number): Promise<void> {
  return api.delete(`/points/${pointId}/delivery-requests/${requestId}`);
}
