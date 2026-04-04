import { ApiProperty } from '@nestjs/swagger';

export class StockUpdatedResponseDto {
  @ApiProperty({ description: 'Number of updated stock items', example: 2 })
  updated: number;
}
