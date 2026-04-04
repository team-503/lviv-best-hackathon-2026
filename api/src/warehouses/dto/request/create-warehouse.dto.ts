import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { LocationDto } from '../../../common/dto/request/location.dto';
import { StockItemDto } from '../../../common/dto/request/stock-item.dto';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Warehouse A', description: 'Warehouse name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: LocationDto, description: 'Warehouse coordinates' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiPropertyOptional({ type: [StockItemDto], description: 'Initial stock items' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockItemDto)
  stock?: StockItemDto[];
}
