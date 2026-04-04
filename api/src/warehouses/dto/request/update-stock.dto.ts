import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { StockItemDto } from '../../../common/dto/request/stock-item.dto';

export class UpdateStockDto {
  @ApiProperty({ type: [StockItemDto], description: 'Stock items to upsert' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockItemDto)
  items: StockItemDto[];
}
