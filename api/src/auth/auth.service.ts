import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { ResourceType } from '../common/enums/resource-type.enum';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import type { AuthUserResponseDto } from './dto/response/auth-user.response.dto';
import type { UserProfile } from './types/user-profile.type';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUserResponseDto;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async login(email: string, password: string): Promise<AuthResult> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      throw new UnauthorizedException(error?.message ?? 'Невірний email або пароль');
    }

    const profile = await this.prisma.profiles.findUnique({
      where: { id: data.user.id },
      select: { display_name: true, role: true },
    });

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email ?? null,
        displayName: profile?.display_name ?? null,
        role: profile?.role ?? 'user',
      },
    };
  }

  async register(name: string, email: string, password: string, role: string): Promise<AuthResult> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });

    if (error || !data.session) {
      throw new UnauthorizedException(error?.message ?? 'Помилка реєстрації');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user!.id,
        email: data.user!.email ?? null,
        displayName: name,
        role,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session) {
      throw new UnauthorizedException(error?.message ?? 'Невалідний refresh token');
    }

    const profile = await this.prisma.profiles.findUnique({
      where: { id: data.user!.id },
      select: { display_name: true, role: true },
    });

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user!.id,
        email: data.user!.email ?? null,
        displayName: profile?.display_name ?? null,
        role: profile?.role ?? 'user',
      },
    };
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
}
