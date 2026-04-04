import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { LocationDto } from '../../../common/dto/request/location.dto';

export class UpdatePointDto {
  @ApiPropertyOptional({ description: 'Point name', example: 'Point 1 (center)' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ type: LocationDto, description: 'Point coordinates' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
