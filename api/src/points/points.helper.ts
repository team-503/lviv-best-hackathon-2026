import type { delivery_requests, products } from '@prisma/client';
import type { CriticalityLevel } from '../common/enums/criticality-level.enum';
import type { RequestStatus } from '../common/enums/request-status.enum';
import type { DeliveryRequestResponseDto } from './dto/response/delivery-request.response.dto';
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

export function toDeliveryRequest(r: delivery_requests & { products: products }): DeliveryRequestResponseDto {
  return {
    id: r.id,
    product: { id: r.products.id, name: r.products.name },
    quantity: r.quantity,
    criticality: r.criticality as unknown as CriticalityLevel,
    status: r.status as unknown as RequestStatus,
    createdAt: r.created_at,
  };
}
