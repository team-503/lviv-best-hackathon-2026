import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthLevel } from '../../common/enums/auth-level.enum';
import { AuthService } from '../auth.service';
import { AUTH_LEVEL_KEY } from '../decorators/auth.decorator';
import type { AuthMetadata } from '../types/auth-metadata.type';

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
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);
    const payload = this.authService.verifyToken(token);
    const sub = payload.sub;
    if (!sub || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sub)) {
      throw new UnauthorizedException('Invalid auth token: missing or malformed user ID');
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
        throw new ForbiddenException('Admin access required');
      }
      return true;
    }
    // read or write — check resource permissions
    if (request.user.role === 'admin') return true;

    const resourceId = Number(request.params.id);
    const entry = await this.authService.getUserPermission(request.user.id, meta.resource, resourceId);
    if (!entry || !entry.permissions.includes(meta.level)) {
      throw new ForbiddenException(
        `Insufficient permissions for this resource. User permissions: ${entry?.permissions.join(', ')}`,
      );
    }

    return true;
  }
}
