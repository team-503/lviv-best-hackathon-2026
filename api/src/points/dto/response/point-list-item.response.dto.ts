import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from '../../../common/dto/request/location.dto';
import { PermissionLevel } from '../../../common/enums/permission-level.enum';

export class PointListItemResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Point 1' })
  name: string;

  @ApiProperty({ type: LocationDto })
  location: LocationDto;

  @ApiProperty({
    enum: PermissionLevel,
    isArray: true,
    nullable: true,
    description: 'User permissions for this point, or null if no access',
    example: [PermissionLevel.Read, PermissionLevel.Write],
  })
  permissions: PermissionLevel[] | null;
}
