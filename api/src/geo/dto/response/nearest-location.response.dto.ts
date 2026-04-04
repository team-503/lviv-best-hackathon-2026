import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from '../../../common/dto/request/location.dto';
import { ResourceType } from '../../../common/enums/resource-type.enum';
import { ProductResponseDto } from '../../../products/dto/response/product.response.dto';

export class NearestLocationResponseDto {
  @ApiProperty({ enum: ResourceType, description: 'Location type', example: ResourceType.Warehouse })
  locationType: ResourceType;

  @ApiProperty({ description: 'Location ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Location name', example: 'Warehouse A' })
  name: string;

  @ApiProperty({ type: LocationDto, description: 'Location coordinates' })
  location: LocationDto;

  @ApiProperty({ description: 'Distance from origin in meters', example: 1250.5 })
  distanceMeters: number;

  @ApiProperty({ type: ProductResponseDto, description: 'Product in stock' })
  product: ProductResponseDto;

  @ApiProperty({ description: 'Available quantity', example: 50 })
  quantity: number;

  @ApiProperty({ description: 'Minimum stock threshold (0 for warehouses)', example: 0 })
  minThreshold: number;

  @ApiProperty({ description: 'Surplus above threshold', example: 50 })
  surplus: number;
}
