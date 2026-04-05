import { ApiProperty } from '@nestjs/swagger';
import { DeliveryRequestResponseDto } from './delivery-request.response.dto';

export class DeliveryRequestListItemResponseDto extends DeliveryRequestResponseDto {
  @ApiProperty({ description: 'Point ID', example: 1 })
  pointId: number;

  @ApiProperty({ description: 'Point name', example: 'Склад-1' })
  pointName: string;
}
