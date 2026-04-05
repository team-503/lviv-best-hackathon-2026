import type { delivery_requests, products } from '@prisma/client';
import type { CriticalityLevel } from '../common/enums/criticality-level.enum';
import type { RequestStatus } from '../common/enums/request-status.enum';
import type { DeliveryRequestListItemResponseDto } from './dto/response/delivery-request-list-item.response.dto';
import type { DeliveryRequestResponseDto } from './dto/response/delivery-request.response.dto';

export function toDeliveryRequest(r: delivery_requests & { products: products }): DeliveryRequestResponseDto {
  return {
    id: r.id,
    product: { id: r.products.id, name: r.products.name },
    quantity: r.quantity,
    criticality: r.criticality as CriticalityLevel,
    status: r.status as RequestStatus,
    createdAt: r.created_at,
  };
}

export function toDeliveryRequestListItem(
  r: delivery_requests & { products: products; points: { id: number; name: string } },
): DeliveryRequestListItemResponseDto {
  return {
    ...toDeliveryRequest(r),
    pointId: r.points.id,
    pointName: r.points.name,
  };
}
