import type { LocationType } from '../../common/enums/location-type.enum';

export interface SourceMatch {
  locationType: LocationType;
  locationId: number;
  locationName: string;
  lat: number;
  lng: number;
  availableQuantity: number;
}
