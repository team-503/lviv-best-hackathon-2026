import { ApiProperty } from '@nestjs/swagger';

export class StockUpdatedResponseDto {
  @ApiProperty({ example: 2, description: 'Number of updated stock items' })
  updated: number;
}
