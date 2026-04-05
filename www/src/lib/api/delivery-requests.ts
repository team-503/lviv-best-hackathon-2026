import { api, offlineAwareMutation } from '../api';
import type { DeliveryRequestListItemResponseDto, DeliveryRequestResponseDto } from '@/types/api';

export function getDeliveryRequests(): Promise<DeliveryRequestListItemResponseDto[]> {
  return api.get('/delivery-requests');
}

export function createDeliveryRequest(
  pointId: number,
  data: { productId: number; quantity: number; criticality: string },
): Promise<DeliveryRequestResponseDto | null> {
  return offlineAwareMutation('post', `/points/${pointId}/delivery-requests`, data);
}

export function updateDeliveryRequest(
  pointId: number,
  requestId: number,
  data: { productId?: number; quantity?: number; criticality?: string },
): Promise<DeliveryRequestResponseDto | null> {
  return offlineAwareMutation('put', `/points/${pointId}/delivery-requests/${requestId}`, data);
}

export function deleteDeliveryRequest(pointId: number, requestId: number): Promise<void | null> {
  return offlineAwareMutation('delete', `/points/${pointId}/delivery-requests/${requestId}`);
}
