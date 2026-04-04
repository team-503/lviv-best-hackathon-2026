import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { StockItemDto } from './stock-item.dto';

export class PointStockItemDto extends StockItemDto {
  @ApiProperty({ description: 'Minimum stock threshold', example: 10 })
  @IsNumber()
  minThreshold: number;
}
