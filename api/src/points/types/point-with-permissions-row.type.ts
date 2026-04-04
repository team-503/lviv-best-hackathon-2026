import type { PermissionLevel } from '../../common/enums/permission-level.enum';
import type { PointRow } from './point-row.type';

export interface PointWithPermissionsRow extends PointRow {
  permissions: PermissionLevel[] | null;
}
