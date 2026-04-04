import { ResourceType } from '../common/enums/resource-type.enum';
import type { NearestLocationResponseDto } from './dto/response/nearest-location.response.dto';
import type { NearestPointResponseDto } from './dto/response/nearest-point.response.dto';
import type { NearestWarehouseResponseDto } from './dto/response/nearest-warehouse.response.dto';
import type { NearestBaseRow } from './types/nearest-base-row.type';
import type { NearestPointRow } from './types/nearest-point-row.type';
import type { NearestWarehouseRow } from './types/nearest-warehouse-row.type';

function mapBaseFields(row: NearestBaseRow): NearestWarehouseResponseDto {
  return {
    id: row.id,
    name: row.name,
    location: { lat: row.lat, lng: row.lng },
    distanceMeters: row.distance_meters,
    product: { id: row.product_id, name: row.product_name },
    quantity: row.quantity,
  };
}

export function toNearestWarehouse(row: NearestWarehouseRow): NearestWarehouseResponseDto {
  return mapBaseFields(row);
}

export function toNearestPoint(row: NearestPointRow): NearestPointResponseDto {
  return {
    ...mapBaseFields(row),
    minThreshold: row.min_threshold,
    surplus: row.surplus,
  };
}

interface NearestLocationRow extends NearestPointRow {
  location_type: string;
}

export function toNearestLocation(row: NearestLocationRow): NearestLocationResponseDto {
  return {
    ...mapBaseFields(row),
    locationType: row.location_type as ResourceType,
    minThreshold: row.min_threshold,
    surplus: row.surplus,
  };
}
