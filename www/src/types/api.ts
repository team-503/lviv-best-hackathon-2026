import type { UserRole } from './user-role';

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

export interface DeliveryRequestListItemResponseDto extends DeliveryRequestResponseDto {
  pointId: number;
  pointName: string;
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

/* ── Auth ── */

export interface AuthUserResponseDto {
  id: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}

export interface AuthResponseDto {
  user: AuthUserResponseDto;
}

/* ── Profiles ── */

export interface ProfileResponseDto {
  id: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
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

/* ── Geo / Nearest ── */

export interface NearestLocationResponseDto {
  locationType: 'warehouse' | 'point';
  id: number;
  name: string;
  location: LocationDto;
  distanceMeters: number;
  product: ProductResponseDto;
  quantity: number;
  minThreshold: number;
  surplus: number;
}

export interface ProductNearestLocationsResponseDto {
  product: ProductResponseDto;
  nearestLocations: NearestLocationResponseDto[];
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

/* ── Delivery Plans ── */

export interface StopLocationDto {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

export interface RouteStopResponseDto {
  order: number;
  locationType: 'warehouse' | 'point';
  location: StopLocationDto;
  product: { id: number; name: string };
  quantity: number;
  action: 'pickup' | 'deliver';
}

export interface PlanRouteResponseDto {
  id: number;
  vehicleNumber: number;
  stops: RouteStopResponseDto[];
}

export interface PlanDetailResponseDto {
  id: number;
  type: 'urgent' | 'standard';
  status: 'draft' | 'executing' | 'completed';
  createdAt?: string;
  routes: PlanRouteResponseDto[];
}

export interface CurrentPlansResponseDto {
  urgent: PlanDetailResponseDto | null;
  standard: PlanDetailResponseDto | null;
}

export interface PlanListItemResponseDto {
  id: number;
  type: 'urgent' | 'standard';
  status: string;
  createdAt: string;
}

/* ── Simulation ── */

export interface SimulationStatusResponseDto {
  status: 'idle' | 'stage1' | 'stage2';
  day: number;
}

export interface SimulationAdvanceResponseDto {
  previousStatus: string;
  newStatus: string;
  day: number;
  executedPlan: PlanDetailResponseDto | null;
}
