import type { WarehouseRow } from './warehouse-row.type';

export interface WarehouseWithPermissionsRow extends WarehouseRow {
  permissions: string[] | null;
}
