import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type PermissionLevel } from '../common/enums/permission-level.enum';
import { ResourceType } from '../common/enums/resource-type.enum';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePermissionDto } from './dto/request/create-permission.dto';
import type { UpdatePermissionDto } from './dto/request/update-permission.dto';
import type { PermissionResponseDto } from './dto/response/permission.response.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PermissionResponseDto[]> {
    const permissions = await this.prisma.user_permissions.findMany({
      orderBy: { id: 'asc' },
    });
    return permissions.map((p) => this.toResponseDto(p));
  }

  async create(dto: CreatePermissionDto): Promise<PermissionResponseDto> {
    await this.validateUserExists(dto.userId);
    await this.validateResourceExists(dto.resourceType, dto.resourceId);

    try {
      const permission = await this.prisma.user_permissions.create({
        data: {
          user_id: dto.userId,
          resource_type: dto.resourceType,
          resource_id: dto.resourceId,
          permissions: dto.permissions,
        },
      });

      return this.toResponseDto(permission);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
        throw new ConflictException('Permission for this user/resource combination already exists');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdatePermissionDto): Promise<PermissionResponseDto> {
    await this.findOneOrFail(id);

    const permission = await this.prisma.user_permissions.update({
      where: { id },
      data: { permissions: dto.permissions },
    });

    return this.toResponseDto(permission);
  }

  async remove(id: number): Promise<void> {
    await this.findOneOrFail(id);
    await this.prisma.user_permissions.delete({ where: { id } });
  }

  private async findOneOrFail(id: number) {
    const permission = await this.prisma.user_permissions.findUnique({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
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

  private toResponseDto(p: {
    id: number;
    user_id: string;
    resource_type: string;
    resource_id: number;
    permissions: string[];
  }): PermissionResponseDto {
    return {
      id: p.id,
      userId: p.user_id,
      resourceType: p.resource_type as ResourceType,
      resourceId: p.resource_id,
      permissions: p.permissions as PermissionLevel[],
    };
  }
}
