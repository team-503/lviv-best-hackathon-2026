import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class FindNearestDto {
  @ApiProperty({ description: 'Latitude of origin', example: 50.45 })
  @Type(() => Number)
  @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Longitude of origin', example: 30.52 })
  @Type(() => Number)
  @IsNumber()
  lng: number;

  @ApiProperty({ description: 'Product ID to search for', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;

  @ApiPropertyOptional({ description: 'Max results to return', example: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
