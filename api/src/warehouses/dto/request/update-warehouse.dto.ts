import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { LocationDto } from '../../../common/dto/request/location.dto';

export class UpdateWarehouseDto {
  @ApiPropertyOptional({ example: 'Warehouse B (new)', description: 'Warehouse name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ type: LocationDto, description: 'Warehouse coordinates' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
