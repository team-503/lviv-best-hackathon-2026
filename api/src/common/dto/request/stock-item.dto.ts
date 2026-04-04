import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class StockItemDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 100, description: 'Quantity' })
  @IsNumber()
  quantity: number;
}
