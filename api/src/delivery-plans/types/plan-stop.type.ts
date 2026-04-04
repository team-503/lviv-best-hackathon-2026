import type { LocationType } from '../../common/enums/location-type.enum';
import type { StopAction } from '../../common/enums/stop-action.enum';

export interface PlanStop {
  stopOrder: number;
  locationType: LocationType;
  warehouseId: number | null;
  pointId: number | null;
  productId: number;
  quantity: number;
  action: StopAction;
  lat: number;
  lng: number;
}
