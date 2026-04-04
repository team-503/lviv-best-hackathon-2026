import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import type { ResourceType } from '../common/enums/resource-type.enum';
import { PrismaService } from '../prisma/prisma.service';
import type { UserProfile } from './types/user-profile.type';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  verifyToken(token: string): jwt.JwtPayload {
    try {
      const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET, {
        algorithms: ['HS256'],
      });
      if (typeof payload === 'string') {
        throw new UnauthorizedException('Invalid token payload');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });

    if (!profile) {
      throw new UnauthorizedException('User profile not found');
    }

    return profile;
  }

  async getUserPermission(userId: string, resourceType?: ResourceType, resourceId?: number) {
    return this.prisma.user_permissions.findFirst({
      where: { user_id: userId, resource_type: resourceType, resource_id: resourceId },
    });
  }
}
