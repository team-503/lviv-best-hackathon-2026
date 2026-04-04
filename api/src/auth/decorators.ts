import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common';
import { AuthLevel } from '../common/enums/auth-level.enum';
import type { PermissionLevel } from '../common/enums/permission-level.enum';
import { ResourceType } from '../common/enums/resource-type.enum';
import type { AuthenticatedRequest, RequestUser } from './auth.types';

export interface AuthMetadata {
  level: AuthLevel | PermissionLevel;
  resource?: ResourceType;
}

export const AUTH_LEVEL_KEY = 'auth:level';

export function Auth(level?: AuthLevel.Admin): MethodDecorator & ClassDecorator;
export function Auth(
  level: PermissionLevel.Read | PermissionLevel.Write,
  resourceType: ResourceType,
): MethodDecorator & ClassDecorator;
export function Auth(level?: AuthLevel | PermissionLevel, resource?: ResourceType): MethodDecorator & ClassDecorator {
  return SetMetadata(AUTH_LEVEL_KEY, {
    level: level ?? AuthLevel.Authenticated,
    resource,
  } satisfies AuthMetadata);
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestUser => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
