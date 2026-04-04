import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { PermissionLevel } from '../../../common/enums/permission-level.enum';

export class UpdatePermissionDto {
  @ApiProperty({
    enum: PermissionLevel,
    isArray: true,
    description: 'Updated permission levels',
    example: [PermissionLevel.Read],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionLevel, { each: true })
  permissions: PermissionLevel[];
}
