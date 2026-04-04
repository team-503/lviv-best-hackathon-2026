import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import type { AuthenticatedRequest } from '../auth.types';
import type { RequiredPermission } from '../decorators';
import { PERMISSION_KEY } from '../decorators';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RequiredPermission | undefined>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { user } = request;

    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    if (user.role === 'admin') return true;

    const resourceId = request.params.id;

    if (!user.permissions) {
      user.permissions = await this.authService.getUserPermissions(user.id);
    }

    const entry = user.permissions.find((p) => p.resource_type === required.resourceType && String(p.resource_id) === resourceId);

    if (!entry || !entry.permissions.includes(required.permission)) {
      throw new ForbiddenException('Insufficient permissions for this resource');
    }

    return true;
  }
}
