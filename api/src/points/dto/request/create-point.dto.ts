import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { LocationDto } from '../../../common/dto/request/location.dto';
import { PointStockItemDto } from '../../../common/dto/request/point-stock-item.dto';

export class CreatePointDto {
  @ApiProperty({ description: 'Point name', example: 'Point 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: LocationDto, description: 'Point coordinates' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiPropertyOptional({ type: [PointStockItemDto], description: 'Initial stock items with thresholds' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PointStockItemDto)
  stock?: PointStockItemDto[];
}
