import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common';
import type { AuthenticatedRequest, RequestUser } from './auth.types';

export enum AuthLevel {
  Authenticated = 'authenticated',
  Read = 'read',
  Write = 'write',
  Admin = 'admin',
}

export interface AuthMetadata {
  level: AuthLevel;
  resourceType?: string;
}

export const AUTH_LEVEL_KEY = 'auth:level';

export function Auth(level?: AuthLevel.Admin): MethodDecorator & ClassDecorator;
export function Auth(level: AuthLevel.Read | AuthLevel.Write, resourceType: string): MethodDecorator & ClassDecorator;
export function Auth(level?: AuthLevel, resourceType?: string): MethodDecorator & ClassDecorator {
  return SetMetadata(AUTH_LEVEL_KEY, {
    level: level ?? AuthLevel.Authenticated,
    resourceType,
  } satisfies AuthMetadata);
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestUser => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
