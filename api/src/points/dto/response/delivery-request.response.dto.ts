import { ApiProperty } from '@nestjs/swagger';
import { CriticalityLevel } from '../../../common/enums/criticality-level.enum';
import { RequestStatus } from '../../../common/enums/request-status.enum';
import { ProductResponseDto } from '../../../products/dto/response/product.response.dto';

export class DeliveryRequestResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: ProductResponseDto })
  product: ProductResponseDto;

  @ApiProperty({ example: 10 })
  quantity: number;

  @ApiProperty({ enum: CriticalityLevel, example: CriticalityLevel.Critical })
  criticality: CriticalityLevel;

  @ApiProperty({ enum: RequestStatus, example: RequestStatus.Active })
  status: RequestStatus;

  @ApiProperty({ example: '2026-04-04T10:00:00Z' })
  createdAt: Date;
}
