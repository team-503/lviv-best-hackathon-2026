export type CriticalityLevel = 'normal' | 'needed' | 'critical' | 'urgent';
export type PointType = 'warehouse' | 'delivery';
export type UserRole = 'admin' | 'warehouse' | 'delivery';

export interface Product {
  id: string;
  name: string;
  unit: string;
}

export interface StockItem {
  productId: string;
  quantity: number;
  minThreshold?: number;
}

export interface DeliveryRequest {
  id: string;
  pointId: string;
  productId: string;
  quantity: number;
  criticality: CriticalityLevel;
  createdAt: string;
  status: 'pending' | 'planned' | 'completed';
}

export interface MapPoint {
  id: string;
  name: string;
  type: PointType;
  lat: number;
  lng: number;
  address: string;
  stock: StockItem[];
  activeRequests: string[];
}

export interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  warehouseId: string;
}

export interface DeliveryRoute {
  vehicleId: string;
  stops: { pointId: string; requestIds: string[] }[];
}

export interface DeliveryPlan {
  id: string;
  date: string;
  routes: DeliveryRoute[];
  status: 'draft' | 'active' | 'completed';
}

// ─── Products ───
export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Паливо (дизель)', unit: 'л' },
  { id: 'p2', name: 'Моторна олива', unit: 'л' },
  { id: 'p3', name: 'Запасні частини', unit: 'шт' },
  { id: 'p4', name: 'Будівельні матеріали', unit: 'кг' },
  { id: 'p5', name: 'Медикаменти', unit: 'упак' },
  { id: 'p6', name: 'Продукти харчування', unit: 'кг' },
];

// ─── Map Points ───
export const MAP_POINTS: MapPoint[] = [
  // Warehouses
  {
    id: 'w1',
    name: 'Склад «Центральний»',
    type: 'warehouse',
    lat: 49.842,
    lng: 24.031,
    address: 'вул. Промислова, 14, Львів',
    stock: [
      { productId: 'p1', quantity: 50000 },
      { productId: 'p2', quantity: 8000 },
      { productId: 'p3', quantity: 1200 },
      { productId: 'p4', quantity: 30000 },
      { productId: 'p5', quantity: 2000 },
      { productId: 'p6', quantity: 15000 },
    ],
    activeRequests: [],
  },
  {
    id: 'w2',
    name: 'Склад «Захід»',
    type: 'warehouse',
    lat: 49.856,
    lng: 23.968,
    address: 'вул. Зелена, 88, Львів',
    stock: [
      { productId: 'p1', quantity: 35000 },
      { productId: 'p2', quantity: 5000 },
      { productId: 'p3', quantity: 800 },
      { productId: 'p4', quantity: 20000 },
      { productId: 'p6', quantity: 10000 },
    ],
    activeRequests: [],
  },
  // Delivery Points
  {
    id: 'd1',
    name: 'Точка «Сихів»',
    type: 'delivery',
    lat: 49.802,
    lng: 24.043,
    address: 'вул. Сихівська, 32, Львів',
    stock: [
      { productId: 'p1', quantity: 1200, minThreshold: 500 },
      { productId: 'p6', quantity: 80, minThreshold: 200 },
    ],
    activeRequests: ['r1', 'r2'],
  },
  {
    id: 'd2',
    name: 'Точка «Залізничний»',
    type: 'delivery',
    lat: 49.836,
    lng: 23.997,
    address: 'пл. Двірцева, 1, Львів',
    stock: [
      { productId: 'p2', quantity: 150, minThreshold: 300 },
      { productId: 'p3', quantity: 12, minThreshold: 50 },
    ],
    activeRequests: ['r3'],
  },
  {
    id: 'd3',
    name: 'Точка «Шевченківський»',
    type: 'delivery',
    lat: 49.863,
    lng: 24.018,
    address: 'вул. Шевченка, 110, Львів',
    stock: [
      { productId: 'p1', quantity: 3000, minThreshold: 1000 },
      { productId: 'p4', quantity: 500, minThreshold: 2000 },
      { productId: 'p5', quantity: 5, minThreshold: 100 },
    ],
    activeRequests: ['r4', 'r5'],
  },
  {
    id: 'd4',
    name: 'Точка «Личаківський»',
    type: 'delivery',
    lat: 49.833,
    lng: 24.068,
    address: 'вул. Личаківська, 200, Львів',
    stock: [
      { productId: 'p5', quantity: 30, minThreshold: 80 },
      { productId: 'p6', quantity: 500, minThreshold: 500 },
    ],
    activeRequests: ['r6'],
  },
  {
    id: 'd5',
    name: 'Точка «Франківський»',
    type: 'delivery',
    lat: 49.82,
    lng: 23.993,
    address: 'вул. Франка, 55, Львів',
    stock: [
      { productId: 'p1', quantity: 800, minThreshold: 500 },
      { productId: 'p2', quantity: 200, minThreshold: 300 },
      { productId: 'p3', quantity: 40, minThreshold: 50 },
    ],
    activeRequests: [],
  },
  {
    id: 'd6',
    name: 'Точка «Галицький»',
    type: 'delivery',
    lat: 49.844,
    lng: 24.022,
    address: 'пл. Галицька, 5, Львів',
    stock: [
      { productId: 'p4', quantity: 1800, minThreshold: 1500 },
      { productId: 'p6', quantity: 300, minThreshold: 300 },
    ],
    activeRequests: ['r7'],
  },
];

// ─── Delivery Requests ───
export const DELIVERY_REQUESTS: DeliveryRequest[] = [
  {
    id: 'r1',
    pointId: 'd1',
    productId: 'p6',
    quantity: 500,
    criticality: 'urgent',
    createdAt: '2026-04-04T06:30:00Z',
    status: 'pending',
  },
  {
    id: 'r2',
    pointId: 'd1',
    productId: 'p1',
    quantity: 2000,
    criticality: 'critical',
    createdAt: '2026-04-04T07:00:00Z',
    status: 'planned',
  },
  {
    id: 'r3',
    pointId: 'd2',
    productId: 'p2',
    quantity: 400,
    criticality: 'critical',
    createdAt: '2026-04-04T07:15:00Z',
    status: 'pending',
  },
  {
    id: 'r4',
    pointId: 'd3',
    productId: 'p5',
    quantity: 150,
    criticality: 'urgent',
    createdAt: '2026-04-04T05:45:00Z',
    status: 'pending',
  },
  {
    id: 'r5',
    pointId: 'd3',
    productId: 'p4',
    quantity: 3000,
    criticality: 'needed',
    createdAt: '2026-04-04T08:00:00Z',
    status: 'planned',
  },
  {
    id: 'r6',
    pointId: 'd4',
    productId: 'p5',
    quantity: 100,
    criticality: 'critical',
    createdAt: '2026-04-04T06:00:00Z',
    status: 'pending',
  },
  {
    id: 'r7',
    pointId: 'd6',
    productId: 'p4',
    quantity: 1200,
    criticality: 'normal',
    createdAt: '2026-04-04T09:00:00Z',
    status: 'pending',
  },
];

// ─── Vehicles ───
export const VEHICLES: Vehicle[] = [
  { id: 'v1', name: 'Truck-01', capacity: 5000, warehouseId: 'w1' },
  { id: 'v2', name: 'Truck-02', capacity: 5000, warehouseId: 'w1' },
  { id: 'v3', name: 'Truck-03', capacity: 3000, warehouseId: 'w2' },
  { id: 'v4', name: 'Truck-04', capacity: 3000, warehouseId: 'w2' },
];

// ─── Delivery Plan ───
export const DELIVERY_PLAN: DeliveryPlan = {
  id: 'plan-2026-04-05',
  date: '2026-04-05',
  status: 'draft',
  routes: [
    {
      vehicleId: 'v1',
      stops: [
        { pointId: 'd1', requestIds: ['r1', 'r2'] },
        { pointId: 'd4', requestIds: ['r6'] },
      ],
    },
    {
      vehicleId: 'v2',
      stops: [{ pointId: 'd3', requestIds: ['r4'] }],
    },
    {
      vehicleId: 'v3',
      stops: [{ pointId: 'd2', requestIds: ['r3'] }],
    },
    {
      vehicleId: 'v4',
      stops: [
        { pointId: 'd3', requestIds: ['r5'] },
        { pointId: 'd6', requestIds: ['r7'] },
      ],
    },
  ],
};

// ─── Current User (mock) ───
export const CURRENT_USER = {
  id: 'u1',
  name: 'Олексій Коваль',
  role: 'admin' as UserRole,
  permissions: [] as string[],
};

// ─── Helpers ───
export const CRITICALITY_CONFIG: Record<
  CriticalityLevel,
  { label: string; color: string; priority: number }
> = {
  urgent: { label: 'Терміново', color: 'destructive', priority: 4 },
  critical: { label: 'Критично', color: 'warning', priority: 3 },
  needed: { label: 'Дуже потрібно', color: 'secondary', priority: 2 },
  normal: { label: 'Нормально', color: 'outline', priority: 1 },
};

export function getProductById(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function getPointById(id: string) {
  return MAP_POINTS.find((p) => p.id === id);
}

export function getVehicleById(id: string) {
  return VEHICLES.find((v) => v.id === id);
}

export function getRequestsByPointId(pointId: string) {
  return DELIVERY_REQUESTS.filter((r) => r.pointId === pointId);
}
