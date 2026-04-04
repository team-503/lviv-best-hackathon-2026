import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { UpdatePointStockItemDto } from './update-point-stock-item.dto';

export class UpdatePointStockDto {
  @ApiProperty({ type: [UpdatePointStockItemDto], description: 'Stock items to update thresholds' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePointStockItemDto)
  items: UpdatePointStockItemDto[];
}
