import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common';
import type { AuthenticatedRequest, RequestUser } from './auth.types';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export interface RequiredPermission {
  permission: string;
  resourceType: string;
}

export const PERMISSION_KEY = 'requiredPermission';
export const RequirePermission = (permission: string, resourceType: string) =>
  SetMetadata(PERMISSION_KEY, { permission, resourceType } satisfies RequiredPermission);

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestUser => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
