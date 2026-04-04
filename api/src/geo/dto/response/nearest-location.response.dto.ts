import { ApiProperty } from '@nestjs/swagger';
import { ResourceType } from '../../../common/enums/resource-type.enum';
import { NearestBaseResponseDto } from './nearest-warehouse.response.dto';

export class NearestLocationResponseDto extends NearestBaseResponseDto {
  @ApiProperty({ enum: ResourceType, description: 'Location type', example: ResourceType.Warehouse })
  locationType: ResourceType;

  @ApiProperty({ description: 'Minimum stock threshold (0 for warehouses)', example: 0 })
  minThreshold: number;

  @ApiProperty({ description: 'Surplus above threshold', example: 50 })
  surplus: number;
}
