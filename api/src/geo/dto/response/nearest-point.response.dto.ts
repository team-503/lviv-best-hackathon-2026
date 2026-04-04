import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from '../../../common/dto/request/location.dto';
import { ProductResponseDto } from '../../../products/dto/response/product.response.dto';

export class NearestPointResponseDto {
  @ApiProperty({ description: 'Point ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Point name', example: 'Point 1' })
  name: string;

  @ApiProperty({ type: LocationDto, description: 'Point coordinates' })
  location: LocationDto;

  @ApiProperty({ description: 'Distance from origin in meters', example: 1250.5 })
  distanceMeters: number;

  @ApiProperty({ type: ProductResponseDto, description: 'Product in stock' })
  product: ProductResponseDto;

  @ApiProperty({ description: 'Available quantity', example: 20 })
  quantity: number;

  @ApiProperty({ description: 'Minimum stock threshold', example: 10 })
  minThreshold: number;

  @ApiProperty({ description: 'Surplus above threshold (quantity - minThreshold)', example: 10 })
  surplus: number;
}
