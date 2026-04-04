export type CriticalityLevel = 'normal' | 'medium' | 'high' | 'critical' | 'urgent';

export interface DeliveryRequest {
  id: string;
  pointId: string;
  productId: string;
  quantity: number;
  criticality: CriticalityLevel;
  createdAt: string;
  status: 'pending' | 'planned' | 'completed';
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
    criticality: 'medium',
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

// ─── Helpers ───
export const CRITICALITY_CONFIG: Record<CriticalityLevel, { label: string; color: string; priority: number }> = {
  urgent: { label: 'Терміново', color: 'destructive', priority: 5 },
  critical: { label: 'Критично', color: 'warning', priority: 4 },
  high: { label: 'Високий', color: 'secondary', priority: 3 },
  medium: { label: 'Середній', color: 'secondary', priority: 2 },
  normal: { label: 'Нормально', color: 'outline', priority: 1 },
};
