import { Body, Controller, Get, HttpCode, Param, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService, type AuthResult } from './auth.service';
import { LoginDto } from './dto/request/login.dto';
import { RegisterDto } from './dto/request/register.dto';
import type { AuthResponseDto } from './dto/response/auth.response.dto';

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  private setAuthCookies(res: Response, result: AuthResult): void {
    res.cookie('access_token', result.accessToken, COOKIE_OPTIONS);
    res.cookie('refresh_token', result.refreshToken, COOKIE_OPTIONS);
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie('access_token', COOKIE_OPTIONS);
    res.clearCookie('refresh_token', COOKIE_OPTIONS);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Авторизація користувача' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
    const result = await this.authService.login(dto.email, dto.password);
    this.setAuthCookies(res, result);
    return { user: result.user };
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Реєстрація нового користувача' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
    const result = await this.authService.register(dto.name, dto.email, dto.password, dto.role);
    this.setAuthCookies(res, result);
    return { user: result.user };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Оновлення токену доступу' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const result = await this.authService.refreshToken(refreshToken);
    this.setAuthCookies(res, result);
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Вихід з системи' })
  logout(@Res({ passthrough: true }) res: Response): void {
    this.clearAuthCookies(res);
  }

  @Get('dev/users')
  @ApiOperation({ summary: '(dev) List all users with profiles' })
  async listUsers(): Promise<{ id: string; email: string | null; role: string; displayName: string | null }[]> {
    if (process.env.NODE_ENV !== 'development') {
      throw new UnauthorizedException('Only available in development mode');
    }

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
    if (process.env.NODE_ENV !== 'development') {
      throw new UnauthorizedException('Only available in development mode');
    }

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
