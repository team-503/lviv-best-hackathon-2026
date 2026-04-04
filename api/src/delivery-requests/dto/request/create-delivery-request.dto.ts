import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsPositive } from 'class-validator';
import { CriticalityLevel } from '../../../common/enums/criticality-level.enum';

export class CreateDeliveryRequestDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({ description: 'Quantity requested', example: 10 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ enum: CriticalityLevel, description: 'Criticality level', example: CriticalityLevel.Critical })
  @IsEnum(CriticalityLevel)
  criticality: CriticalityLevel;
}
