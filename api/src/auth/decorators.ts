import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common';
import type { AuthenticatedRequest, RequestUser } from './auth.types';

export enum AuthLevel {
  Authenticated = 'authenticated',
  Read = 'read',
  Write = 'write',
  Admin = 'admin',
}

export enum AuthResource {
  Warehouse = 'warehouse',
  Point = 'point',
}

export interface AuthMetadata {
  level: AuthLevel;
  resource?: AuthResource;
}

export const AUTH_LEVEL_KEY = 'auth:level';

export function Auth(level?: AuthLevel.Admin): MethodDecorator & ClassDecorator;
export function Auth(level: AuthLevel.Read | AuthLevel.Write, resourceType: AuthResource): MethodDecorator & ClassDecorator;
export function Auth(level?: AuthLevel, resource?: AuthResource): MethodDecorator & ClassDecorator {
  return SetMetadata(AUTH_LEVEL_KEY, {
    level: level ?? AuthLevel.Authenticated,
    resource,
  } satisfies AuthMetadata);
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestUser => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
