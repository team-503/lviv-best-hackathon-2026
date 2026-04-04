import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from '../../../common/dto/request/location.dto';
import { ProductResponseDto } from '../../../products/dto/response/product.response.dto';

export class NearestBaseResponseDto {
  @ApiProperty({ description: 'ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Name', example: 'Warehouse A' })
  name: string;

  @ApiProperty({ type: LocationDto, description: 'Coordinates' })
  location: LocationDto;

  @ApiProperty({ description: 'Distance from origin in meters', example: 1250.5 })
  distanceMeters: number;

  @ApiProperty({ type: ProductResponseDto, description: 'Product in stock' })
  product: ProductResponseDto;

  @ApiProperty({ description: 'Available quantity', example: 50 })
  quantity: number;
}

export class NearestWarehouseResponseDto extends NearestBaseResponseDto {}
