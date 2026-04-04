import { api } from '../api';
import type { WarehouseListItemResponseDto, WarehouseDetailResponseDto, StockUpdatedResponseDto } from '@/types/api';

export function getWarehouses(): Promise<WarehouseListItemResponseDto[]> {
  return api.get('/warehouses');
}

export function getWarehouse(id: number): Promise<WarehouseDetailResponseDto> {
  return api.get(`/warehouses/${id}`);
}

export function createWarehouse(data: {
  name: string;
  location: { lat: number; lng: number };
  stock?: { productId: number; quantity: number }[];
}): Promise<WarehouseDetailResponseDto> {
  return api.post('/warehouses', data);
}

export function updateWarehouse(
  id: number,
  data: {
    name?: string;
    location?: { lat: number; lng: number };
  },
): Promise<{ id: number; name: string; location: { lat: number; lng: number } }> {
  return api.put(`/warehouses/${id}`, data);
}

export function updateWarehouseStock(
  id: number,
  items: {
    productId: number;
    quantity: number;
  }[],
): Promise<StockUpdatedResponseDto> {
  return api.patch(`/warehouses/${id}/stock`, { items });
}

export function deleteWarehouse(id: number): Promise<void> {
  return api.delete(`/warehouses/${id}`);
}
