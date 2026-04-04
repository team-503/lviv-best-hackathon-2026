import type { PointListItemResponseDto } from './dto/response/point-list-item.response.dto';
import type { PointStockItemResponseDto } from './dto/response/point-stock-item.response.dto';
import type { PointResponseDto } from './dto/response/point.response.dto';
import type { PointRow } from './types/point-row.type';
import type { PointWithPermissionsRow } from './types/point-with-permissions-row.type';

export function toPointBase(row: PointRow): PointResponseDto {
  return {
    id: row.id,
    name: row.name,
    location: { lat: row.lat, lng: row.lng },
  };
}

export function toPointListItem(row: PointWithPermissionsRow): PointListItemResponseDto {
  return {
    ...toPointBase(row),
    permissions: row.permissions ?? null,
  };
}

export function toPointStockItem(s: {
  products: { id: number; name: string };
  quantity: number;
  min_threshold: number;
}): PointStockItemResponseDto {
  return {
    product: { id: s.products.id, name: s.products.name },
    quantity: s.quantity,
    minThreshold: s.min_threshold,
  };
}
