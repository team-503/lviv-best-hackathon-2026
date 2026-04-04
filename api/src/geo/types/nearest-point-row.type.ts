import type { NearestBaseRow } from './nearest-base-row.type';

export interface NearestPointRow extends NearestBaseRow {
  min_threshold: number;
  surplus: number;
}
