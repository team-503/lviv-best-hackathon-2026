import { Injectable, NotFoundException } from '@nestjs/common';
import { ResourceType } from '../common/enums/resource-type.enum';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePermissionDto } from './dto/request/create-permission.dto';
import type { UpdatePermissionDto } from './dto/request/update-permission.dto';
import type { PermissionResponseDto } from './dto/response/permission.response.dto';
import { toPermissionResponseDto } from './permissions.helper';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PermissionResponseDto[]> {
    const permissions = await this.prisma.user_permissions.findMany({
      orderBy: { id: 'asc' },
    });
    return permissions.map((p) => toPermissionResponseDto(p));
  }

  async create(dto: CreatePermissionDto): Promise<PermissionResponseDto> {
    await Promise.all([this.validateUserExists(dto.userId), this.validateResourceExists(dto.resourceType, dto.resourceId)]);

    const permission = await this.prisma.user_permissions.create({
      data: {
        user_id: dto.userId,
        resource_type: dto.resourceType,
        resource_id: dto.resourceId,
        permissions: dto.permissions,
      },
    });

    return toPermissionResponseDto(permission);
  }

  async update(id: number, dto: UpdatePermissionDto): Promise<PermissionResponseDto> {
    const permission = await this.prisma.user_permissions.update({
      where: { id },
      data: { permissions: dto.permissions },
    });

    return toPermissionResponseDto(permission);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.user_permissions.delete({ where: { id } });
  }

  private async validateUserExists(userId: string): Promise<void> {
    const profile = await this.prisma.profiles.findUnique({ where: { id: userId } });
    if (!profile) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  private async validateResourceExists(type: ResourceType, resourceId: number): Promise<void> {
    if (type === ResourceType.Point) {
      const point = await this.prisma.points.findUnique({ where: { id: resourceId } });
      if (!point) {
        throw new NotFoundException(`Point with ID ${resourceId} not found`);
      }
    } else {
      const warehouse = await this.prisma.warehouses.findUnique({ where: { id: resourceId } });
      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID ${resourceId} not found`);
      }
    }
  }
}
