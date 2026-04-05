import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from '../../../products/dto/response/product.response.dto';
import { NearestLocationResponseDto } from './nearest-location.response.dto';

export class ProductNearestLocationsResponseDto {
  @ApiProperty({ type: ProductResponseDto, description: 'Product' })
  product: ProductResponseDto;

  @ApiProperty({ type: NearestLocationResponseDto, isArray: true, description: 'Nearest locations with this product in stock' })
  nearestLocations: NearestLocationResponseDto[];
}
