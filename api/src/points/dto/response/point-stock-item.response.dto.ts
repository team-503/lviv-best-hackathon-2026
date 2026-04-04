import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductResponseDto } from '../../../products/dto/response/product.response.dto';

export class PointStockItemResponseDto {
  @ApiProperty({ type: ProductResponseDto })
  @Type(() => ProductResponseDto)
  product: ProductResponseDto;

  @ApiProperty({ example: 5 })
  quantity: number;

  @ApiProperty({ description: 'Minimum stock threshold — quantity below this means deficit', example: 10 })
  minThreshold: number;
}
