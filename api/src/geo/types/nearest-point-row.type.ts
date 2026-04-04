export interface NearestPointRow {
  id: number;
  name: string;
  lat: number;
  lng: number;
  distance_meters: number;
  product_id: number;
  product_name: string;
  quantity: number;
  min_threshold: number;
  surplus: number;
}
