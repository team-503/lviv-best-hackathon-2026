import { ApiProperty } from '@nestjs/swagger';
import { PermissionLevel } from '../../../common/enums/permission-level.enum';
import { ResourceType } from '../../../common/enums/resource-type.enum';

export class PermissionResponseDto {
  @ApiProperty({ description: 'Permission record ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiProperty({ enum: ResourceType, description: 'Resource type', example: ResourceType.Point })
  resourceType: ResourceType;

  @ApiProperty({ description: 'Resource ID', example: 1 })
  resourceId: number;

  @ApiProperty({
    enum: PermissionLevel,
    isArray: true,
    description: 'Permission levels',
    example: [PermissionLevel.Read, PermissionLevel.Write],
  })
  permissions: PermissionLevel[];
}
