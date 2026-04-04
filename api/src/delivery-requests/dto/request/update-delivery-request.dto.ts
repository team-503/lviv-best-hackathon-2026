import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { CriticalityLevel } from '../../../common/enums/criticality-level.enum';

export class UpdateDeliveryRequestDto {
  @ApiPropertyOptional({ description: 'Product ID', example: 2 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  productId?: number;

  @ApiPropertyOptional({ description: 'Quantity requested', example: 5 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  @ApiPropertyOptional({ enum: CriticalityLevel, description: 'Criticality level', example: CriticalityLevel.Urgent })
  @IsOptional()
  @IsEnum(CriticalityLevel)
  criticality?: CriticalityLevel;
}
