import { AuthLevel } from '../common/enums/auth-level.enum';
import { PermissionLevel } from '../common/enums/permission-level.enum';
import type { ResourceType } from '../common/enums/resource-type.enum';
import type { CombinedAuthLevel } from './types/combined-auth-level.type';

export function getPermissionDescription(level: CombinedAuthLevel, resource?: ResourceType): string {
  switch (level) {
    case AuthLevel.Admin:
      return 'Requires admin role';
    case PermissionLevel.Read:
      return `Requires read permission on ${resource}`;
    case PermissionLevel.Write:
      return `Requires write permission on ${resource}`;
    case AuthLevel.Authenticated:
      return 'Requires authentication';
  }
}
