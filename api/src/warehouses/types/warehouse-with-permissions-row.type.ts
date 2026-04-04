import type { PermissionLevel } from '../../common/enums/permission-level.enum';
import type { WarehouseRow } from './warehouse-row.type';

export interface WarehouseWithPermissionsRow extends WarehouseRow {
  permissions: PermissionLevel[] | null;
}
