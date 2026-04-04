import type { AuthLevel } from '../../common/enums/auth-level.enum';
import type { PermissionLevel } from '../../common/enums/permission-level.enum';

export type CombinedAuthLevel = AuthLevel | PermissionLevel;
