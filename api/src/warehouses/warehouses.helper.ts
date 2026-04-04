import type { WarehouseListItemResponseDto } from './dto/response/warehouse-list-item.response.dto';
import type { WarehouseStockItemResponseDto } from './dto/response/warehouse-stock-item.response.dto';
import type { WarehouseResponseDto } from './dto/response/warehouse.response.dto';
import type { WarehouseRow } from './types/warehouse-row.type';
import type { WarehouseWithPermissionsRow } from './types/warehouse-with-permissions-row.type';

export function toWarehouseBase(row: WarehouseRow): WarehouseResponseDto {
  return {
    id: row.id,
    name: row.name,
    location: { lat: row.lat, lng: row.lng },
  };
}

export function toWarehouseListItem(row: WarehouseWithPermissionsRow): WarehouseListItemResponseDto {
  return {
    ...toWarehouseBase(row),
    permissions: row.permissions ?? null,
  };
}

export function toStockItem(s: { products: { id: number; name: string }; quantity: number }): WarehouseStockItemResponseDto {
  return {
    product: { id: s.products.id, name: s.products.name },
    quantity: s.quantity,
  };
}
