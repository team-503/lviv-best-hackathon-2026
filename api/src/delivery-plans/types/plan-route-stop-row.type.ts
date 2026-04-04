export interface PlanRouteStopRow {
  route_id: number;
  vehicle_number: number;
  stop_id: number;
  stop_order: number;
  location_type: string;
  warehouse_id: number | null;
  point_id: number | null;
  location_name: string;
  lat: number;
  lng: number;
  product_id: number;
  product_name: string;
  quantity: number;
  action: string;
}
