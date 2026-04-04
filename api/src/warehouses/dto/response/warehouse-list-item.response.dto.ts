import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from '../../../common/dto/request/location.dto';

export class WarehouseListItemResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Warehouse A' })
  name: string;

  @ApiProperty({ type: LocationDto })
  location: LocationDto;

  @ApiProperty({
    type: [String],
    nullable: true,
    example: ['read', 'write'],
    description: 'User permissions for this warehouse, or null if no access',
  })
  permissions: string[] | null;
}
