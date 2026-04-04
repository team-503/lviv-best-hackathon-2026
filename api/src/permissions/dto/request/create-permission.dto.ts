import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum, IsInt, IsPositive, IsUUID } from 'class-validator';
import { PermissionLevel } from '../../../common/enums/permission-level.enum';
import { ResourceType } from '../../../common/enums/resource-type.enum';

export class CreatePermissionDto {
  @ApiProperty({ description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: ResourceType, description: 'Resource type', example: ResourceType.Point })
  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @ApiProperty({ description: 'Resource ID', example: 1 })
  @IsInt()
  @IsPositive()
  resourceId: number;

  @ApiProperty({
    enum: PermissionLevel,
    isArray: true,
    description: 'Permission levels',
    example: [PermissionLevel.Read, PermissionLevel.Write],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionLevel, { each: true })
  permissions: PermissionLevel[];
}
