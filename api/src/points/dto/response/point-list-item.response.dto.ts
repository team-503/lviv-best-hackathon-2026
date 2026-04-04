import { ApiProperty } from '@nestjs/swagger';
import { PermissionLevel } from '../../../common/enums/permission-level.enum';
import { PointResponseDto } from './point.response.dto';

export class PointListItemResponseDto extends PointResponseDto {
  @ApiProperty({
    enum: PermissionLevel,
    isArray: true,
    nullable: true,
    description: 'User permissions for this point, or null if no access',
    example: [PermissionLevel.Read, PermissionLevel.Write],
  })
  permissions: PermissionLevel[] | null;
}
