import { ApiProperty } from '@nestjs/swagger';
import { NearestBaseResponseDto } from './nearest-warehouse.response.dto';

export class NearestPointResponseDto extends NearestBaseResponseDto {
  @ApiProperty({ description: 'Minimum stock threshold', example: 10 })
  minThreshold: number;

  @ApiProperty({ description: 'Surplus above threshold (quantity - minThreshold)', example: 10 })
  surplus: number;
}
