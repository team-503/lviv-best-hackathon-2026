export interface DeliveryRequestRow {
  id: number;
  point_id: number;
  point_name: string;
  lat: number;
  lng: number;
  product_id: number;
  product_name: string;
  quantity: number;
  criticality: string;
}
