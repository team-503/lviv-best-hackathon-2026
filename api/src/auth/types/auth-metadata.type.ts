import type { ResourceType } from '../../common/enums/resource-type.enum';
import type { CombinedAuthLevel } from './combined-auth-level.type';

export interface AuthMetadata {
  level: CombinedAuthLevel;
  resource?: ResourceType;
}
