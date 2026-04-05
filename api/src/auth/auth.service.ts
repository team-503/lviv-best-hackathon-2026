import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ResourceType } from '../common/enums/resource-type.enum';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { AUTH_COOKIE_OPTIONS } from './auth.constants';
import type { LoginDto } from './dto/request/login.dto';
import type { RegisterDto } from './dto/request/register.dto';
import type { AuthResponseDto } from './dto/response/auth.response.dto';
import type { AuthTokens } from './types/auth-tokens.type';
import type { UserProfile } from './types/user-profile.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async login(dto: LoginDto, res: Response): Promise<AuthResponseDto> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException(error?.message ?? 'Invalid email or password');
    }

    const profile = await this.prisma.profiles.findUnique({
      where: { id: data.user.id },
      select: { display_name: true, role: true },
    });

    this.setAuthCookies(res, {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });

    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? null,
        displayName: profile?.display_name ?? null,
        role: profile?.role ?? 'user',
      },
    };
  }

  async register(dto: RegisterDto, res: Response): Promise<AuthResponseDto> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: { data: { name: dto.name, role: dto.role } },
    });

    if (error || !data.session) {
      throw new UnauthorizedException(error?.message ?? 'Registration failed');
    }

    this.setAuthCookies(res, {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });

    return {
      user: {
        id: data.user!.id,
        email: data.user!.email ?? null,
        displayName: dto.name,
        role: dto.role,
      },
    };
  }

  async refresh(req: Request, res: Response): Promise<AuthResponseDto> {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session) {
      throw new UnauthorizedException(error?.message ?? 'Invalid refresh token');
    }

    const profile = await this.prisma.profiles.findUnique({
      where: { id: data.user!.id },
      select: { display_name: true, role: true },
    });

    this.setAuthCookies(res, {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });

    return {
      user: {
        id: data.user!.id,
        email: data.user!.email ?? null,
        displayName: profile?.display_name ?? null,
        role: profile?.role ?? 'user',
      },
    };
  }

  logout(res: Response): void {
    this.clearAuthCookies(res);
  }

  async verifyToken(token: string): Promise<{ sub: string }> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return { sub: data.user.id };
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

  private setAuthCookies(res: Response, tokens: AuthTokens): void {
    res.cookie('access_token', tokens.accessToken, AUTH_COOKIE_OPTIONS);
    res.cookie('refresh_token', tokens.refreshToken, AUTH_COOKIE_OPTIONS);
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie('access_token', AUTH_COOKIE_OPTIONS);
    res.clearCookie('refresh_token', AUTH_COOKIE_OPTIONS);
  }
}
