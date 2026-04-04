import type { delivery_requests, products } from '@prisma/client';
import type { CriticalityLevel } from '../common/enums/criticality-level.enum';
import type { RequestStatus } from '../common/enums/request-status.enum';
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
