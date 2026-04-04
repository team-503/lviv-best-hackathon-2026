import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

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

  // TODO: fix inline type
  async getProfile(userId: string): Promise<{ role: string; email: string | null }> {
    const profile = await this.prisma.profiles.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });

    if (!profile) {
      throw new UnauthorizedException('User profile not found');
    }

    return profile;
  }

  async getUserPermissions(userId: string) {
    return this.prisma.user_permissions.findMany({
      where: { user_id: userId },
    });
  }
}
