import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { AUTH_LEVEL_KEY, AuthLevel, type AuthMetadata } from '../decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const meta = this.reflector.getAllAndOverride<AuthMetadata | undefined>(AUTH_LEVEL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!meta) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('[Auth] Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);
    const payload = this.authService.verifyToken(token);
    const sub = payload.sub;
    if (!sub || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sub)) {
      throw new UnauthorizedException('[Auth] Invalid token: missing or malformed user ID');
    }

    const profile = await this.authService.getProfile(sub);
    request.user = {
      id: sub,
      email: profile.email ?? undefined,
      role: profile.role,
    };

    if (meta.level === AuthLevel.Authenticated) return true;
    if (meta.level === AuthLevel.Admin) {
      if (request.user.role !== 'admin') {
        throw new ForbiddenException('[Auth] Admin access required');
      }
      return true;
    }
    // read or write — check resource permissions
    if (request.user.role === 'admin') return true;

    const permissions = await this.authService.getUserPermissions(request.user.id);
    const resourceId = request.params.id;
    const entry = permissions.find((p) => p.resource_type === meta.resourceType && String(p.resource_id) === resourceId);
    if (!entry || !entry.permissions.includes(meta.level)) {
      throw new ForbiddenException('[Auth] Insufficient permissions for this resource');
    }

    return true;
  }
}
