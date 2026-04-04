import { ResourceType } from '../common/enums/resource-type.enum';
import type { NearestLocationResponseDto } from './dto/response/nearest-location.response.dto';
import type { NearestPointResponseDto } from './dto/response/nearest-point.response.dto';
import type { NearestWarehouseResponseDto } from './dto/response/nearest-warehouse.response.dto';
import type { NearestPointRow } from './types/nearest-point-row.type';
import type { NearestWarehouseRow } from './types/nearest-warehouse-row.type';

export function toNearestWarehouse(row: NearestWarehouseRow): NearestWarehouseResponseDto {
  return {
    id: row.id,
    name: row.name,
    location: { lat: row.lat, lng: row.lng },
    distanceMeters: row.distance_meters,
    product: { id: row.product_id, name: row.product_name },
    quantity: row.quantity,
  };
}

export function toNearestPoint(row: NearestPointRow): NearestPointResponseDto {
  return {
    id: row.id,
    name: row.name,
    location: { lat: row.lat, lng: row.lng },
    distanceMeters: row.distance_meters,
    product: { id: row.product_id, name: row.product_name },
    quantity: row.quantity,
    minThreshold: row.min_threshold,
    surplus: row.surplus,
  };
}

interface NearestLocationRow extends NearestPointRow {
  location_type: string;
}

export function toNearestLocation(row: NearestLocationRow): NearestLocationResponseDto {
  return {
    locationType: row.location_type as ResourceType,
    id: row.id,
    name: row.name,
    location: { lat: row.lat, lng: row.lng },
    distanceMeters: row.distance_meters,
    product: { id: row.product_id, name: row.product_name },
    quantity: row.quantity,
    minThreshold: row.min_threshold,
    surplus: row.surplus,
  };
}
