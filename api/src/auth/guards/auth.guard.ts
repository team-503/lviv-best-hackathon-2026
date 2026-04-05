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
    const token =
      (request.cookies as Record<string, string> | undefined)?.access_token ||
      request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Missing or invalid Authorization');
    }
    const { sub } = await this.authService.verifyToken(token);

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
