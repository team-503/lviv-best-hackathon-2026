import { Controller, Get, Param, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Auth (dev only)')
@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('AuthController is only available in development mode');
    }
  }

  @Get('dev/users')
  @ApiOperation({ summary: '(dev) List all users with profiles' })
  async listUsers(): Promise<{ id: string; email: string | null; role: string; displayName: string | null }[]> {
    const profiles = await this.prisma.profiles.findMany({
      select: { id: true, email: true, role: true, display_name: true },
    });

    return profiles.map((p) => ({
      id: p.id,
      email: p.email,
      role: p.role,
      displayName: p.display_name,
    }));
  }

  @Get('dev/token/:userId')
  @ApiOperation({ summary: '(dev) Generate a JWT token for a user' })
  generateToken(@Param('userId') userId: string): { accessToken: string; userId: string } {
    if (!process.env.SUPABASE_JWT_SECRET) {
      throw new UnauthorizedException('SUPABASE_JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        role: 'authenticated',
      },
      process.env.SUPABASE_JWT_SECRET,
      { algorithm: 'HS256' },
    );

    return { accessToken: token, userId };
  }
}
