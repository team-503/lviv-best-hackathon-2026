import type { PermissionLevel } from '../common/enums/permission-level.enum';
import { type ResourceType } from '../common/enums/resource-type.enum';
import type { PermissionResponseDto } from './dto/response/permission.response.dto';

export function toPermissionResponseDto(p: {
  id: number;
  user_id: string;
  resource_type: string;
  resource_id: number;
  permissions: string[];
}): PermissionResponseDto {
  return {
    id: p.id,
    userId: p.user_id,
    resourceType: p.resource_type as ResourceType,
    resourceId: p.resource_id,
    permissions: p.permissions as PermissionLevel[],
  };
}
