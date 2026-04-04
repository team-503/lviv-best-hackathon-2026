import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from '../../../common/dto/request/location.dto';
import { ProductResponseDto } from '../../../products/dto/response/product.response.dto';

export class NearestWarehouseResponseDto {
  @ApiProperty({ description: 'Warehouse ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Warehouse name', example: 'Warehouse A' })
  name: string;

  @ApiProperty({ type: LocationDto, description: 'Warehouse coordinates' })
  location: LocationDto;

  @ApiProperty({ description: 'Distance from origin in meters', example: 1250.5 })
  distanceMeters: number;

  @ApiProperty({ type: ProductResponseDto, description: 'Product in stock' })
  product: ProductResponseDto;

  @ApiProperty({ description: 'Available quantity', example: 50 })
  quantity: number;
}
