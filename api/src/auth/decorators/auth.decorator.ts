import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthLevel } from '../../common/enums/auth-level.enum';
import { PermissionLevel } from '../../common/enums/permission-level.enum';
import { ResourceType } from '../../common/enums/resource-type.enum';
import { getPermissionDescription } from '../auth.helper';

type CombinedAuthLevel = AuthLevel | PermissionLevel;

export interface AuthMetadata {
  level: CombinedAuthLevel;
  resource?: ResourceType;
}

export const AUTH_LEVEL_KEY = 'auth:level';

export function Auth(level?: AuthLevel.Admin): MethodDecorator & ClassDecorator;
export function Auth(
  level: PermissionLevel.Read | PermissionLevel.Write,
  resourceType: ResourceType,
): MethodDecorator & ClassDecorator;
export function Auth(level?: CombinedAuthLevel, resource?: ResourceType): MethodDecorator & ClassDecorator {
  const resolvedLevel = level ?? AuthLevel.Authenticated;

  return applyDecorators(
    SetMetadata(AUTH_LEVEL_KEY, { level: resolvedLevel, resource } satisfies AuthMetadata),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Not authenticated' }),
    ApiForbiddenResponse({ description: getPermissionDescription(resolvedLevel, resource) }),
  );
}
