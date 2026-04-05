import { api } from '../api';
import type { PointListItemResponseDto, PointDetailResponseDto, StockUpdatedResponseDto } from '@/types/api';

export function getPoints(): Promise<PointListItemResponseDto[]> {
  return api.get('/points');
}

export function getPoint(id: number): Promise<PointDetailResponseDto> {
  return api.get(`/points/${id}`);
}

export function createPoint(data: {
  name: string;
  location: { lat: number; lng: number };
  stock?: { productId: number; quantity: number; minThreshold: number }[];
}): Promise<PointDetailResponseDto> {
  return api.post('/points', data);
}

export function updatePoint(
  id: number,
  data: {
    name?: string;
    location?: { lat: number; lng: number };
  },
): Promise<{ id: number; name: string; location: { lat: number; lng: number } }> {
  return api.put(`/points/${id}`, data);
}

export function updatePointStock(
  id: number,
  items: {
    productId: number;
    minThreshold: number;
  }[],
): Promise<StockUpdatedResponseDto> {
  return api.patch(`/points/${id}/stock`, { items });
}

export function deletePoint(id: number): Promise<void> {
  return api.delete(`/points/${id}`);
}
