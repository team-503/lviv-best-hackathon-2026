import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from '../../../common/dto/request/location.dto';
import { DeliveryRequestResponseDto } from './delivery-request.response.dto';
import { PointStockItemResponseDto } from './point-stock-item.response.dto';

export class PointDetailResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Point 1' })
  name: string;

  @ApiProperty({ type: LocationDto })
  location: LocationDto;

  @ApiProperty({ type: [PointStockItemResponseDto] })
  stock: PointStockItemResponseDto[];

  @ApiProperty({ type: [DeliveryRequestResponseDto] })
  deliveryRequests: DeliveryRequestResponseDto[];
}
