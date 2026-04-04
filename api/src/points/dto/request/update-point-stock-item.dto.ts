import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdatePointStockItemDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Minimum stock threshold', example: 15 })
  @IsNumber()
  minThreshold: number;
}
