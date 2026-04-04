import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from '../../../common/dto/request/location.dto';
import { WarehouseStockItemResponseDto } from './warehouse-stock-item.response.dto';

export class WarehouseDetailResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Warehouse A' })
  name: string;

  @ApiProperty({ type: LocationDto })
  location: LocationDto;

  @ApiProperty({ type: [WarehouseStockItemResponseDto] })
  stock: WarehouseStockItemResponseDto[];
}
