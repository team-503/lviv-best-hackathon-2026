import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profiles.findUnique({
      where: { id: userId },
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

  async getAllUsers() {
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
