import { ApiProperty } from '@nestjs/swagger';
import { DeliveryRequestResponseDto } from '../../../delivery-requests/dto/response/delivery-request.response.dto';
import { PointStockItemResponseDto } from './point-stock-item.response.dto';
import { PointResponseDto } from './point.response.dto';

export class PointDetailResponseDto extends PointResponseDto {
  @ApiProperty({ type: [PointStockItemResponseDto] })
  stock: PointStockItemResponseDto[];

  @ApiProperty({ type: [DeliveryRequestResponseDto] })
  deliveryRequests: DeliveryRequestResponseDto[];
}
