import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from '../../../common/dto/request/location.dto';
import { PermissionLevel } from '../../../common/enums/permission-level.enum';

export class WarehouseListItemResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Warehouse A' })
  name: string;

  @ApiProperty({ type: LocationDto })
  location: LocationDto;

  @ApiProperty({
    enum: PermissionLevel,
    isArray: true,
    nullable: true,
    description: 'User permissions for this warehouse, or null if no access',
    example: [PermissionLevel.Read, PermissionLevel.Write],
  })
  permissions: PermissionLevel[] | null;
}
