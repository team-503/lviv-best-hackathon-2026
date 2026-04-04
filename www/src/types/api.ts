/* ── Shared ── */

export interface LocationDto {
  lat: number;
  lng: number;
}

/* ── Products ── */

export interface ProductResponseDto {
  id: number;
  name: string;
}

/* ── Points ── */

export interface PointListItemResponseDto {
  id: number;
  name: string;
  location: LocationDto;
  permissions: string[] | null;
}

export interface PointStockItemResponseDto {
  product: ProductResponseDto;
  quantity: number;
  minThreshold: number;
}

export interface DeliveryRequestResponseDto {
  id: number;
  product: ProductResponseDto;
  quantity: number;
  criticality: string;
  status: string;
  createdAt: string;
}

export interface PointDetailResponseDto {
  id: number;
  name: string;
  location: LocationDto;
  stock: PointStockItemResponseDto[];
  deliveryRequests: DeliveryRequestResponseDto[];
}

/* ── Warehouses ── */

export interface WarehouseListItemResponseDto {
  id: number;
  name: string;
  location: LocationDto;
  permissions: string[] | null;
}

export interface WarehouseStockItemResponseDto {
  product: ProductResponseDto;
  quantity: number;
}

export interface WarehouseDetailResponseDto {
  id: number;
  name: string;
  location: LocationDto;
  stock: WarehouseStockItemResponseDto[];
}

/* ── Profiles ── */

export interface ProfileResponseDto {
  id: string;
  email: string | null;
  displayName: string | null;
  role: string;
  createdAt: string;
}

export interface UserResponseDto {
  id: string;
  email: string | null;
  displayName: string | null;
  role: string;
}

/* ── Permissions ── */

export interface PermissionResponseDto {
  id: number;
  userId: string;
  resourceType: string;
  resourceId: number;
  permissions: string[];
}

/* ── Stock Update ── */

export interface StockUpdatedResponseDto {
  updated: number;
}

/* ── Unified MapPoint for frontend map view ── */

export interface MapPoint {
  id: number;
  name: string;
  type: 'warehouse' | 'point';
  lat: number;
  lng: number;
  permissions: string[] | null;
}
