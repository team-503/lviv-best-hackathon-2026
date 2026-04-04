import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ProfileResponseDto } from './dto/response/profile.response.dto';
import type { UserResponseDto } from './dto/response/user.response.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const profile = await this.prisma.profiles.findUnique({
      where: { id: userId },
      select: { id: true, email: true, display_name: true, role: true, created_at: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      role: profile.role,
      createdAt: profile.created_at,
    };
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const profiles = await this.prisma.profiles.findMany({
      select: { id: true, email: true, display_name: true, role: true },
    });

    return profiles.map((p) => ({
      id: p.id,
      email: p.email,
      displayName: p.display_name,
      role: p.role,
    }));
  }
}
