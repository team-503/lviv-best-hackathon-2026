import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from '../../../common/dto/request/location.dto';

export class WarehouseResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Warehouse A' })
  name: string;

  @ApiProperty({ type: LocationDto })
  location: LocationDto;
}
