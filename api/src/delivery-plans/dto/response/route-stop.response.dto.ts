import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from '../../../products/dto/response/product.response.dto';
import { StopLocationResponseDto } from './stop-location.response.dto';

export class RouteStopResponseDto {
  @ApiProperty({ description: 'Stop order in route', example: 1 })
  order: number;

  @ApiProperty({ description: 'Location type', example: 'warehouse' })
  locationType: string;

  @ApiProperty({ type: StopLocationResponseDto, description: 'Stop location details' })
  location: StopLocationResponseDto;

  @ApiProperty({ type: ProductResponseDto, description: 'Product being transported' })
  product: ProductResponseDto;

  @ApiProperty({ description: 'Quantity of product', example: 10 })
  quantity: number;

  @ApiProperty({ description: 'Action at stop', example: 'pickup' })
  action: string;
}
