import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { RequestUser } from '../auth/auth.types';
import { PermissionLevel } from '../common/enums/permission-level.enum';
import { RequestStatus } from '../common/enums/request-status.enum';
import { ResourceType } from '../common/enums/resource-type.enum';
import { DeliveryPlansService } from '../delivery-plans/delivery-plans.service';
import { PrismaService } from '../prisma/prisma.service';
import { toDeliveryRequest, toDeliveryRequestListItem } from './delivery-requests.helper';
import type { CreateDeliveryRequestDto } from './dto/request/create-delivery-request.dto';
import type { UpdateDeliveryRequestDto } from './dto/request/update-delivery-request.dto';
import type { DeliveryRequestListItemResponseDto } from './dto/response/delivery-request-list-item.response.dto';
import type { DeliveryRequestResponseDto } from './dto/response/delivery-request.response.dto';

@Injectable()
export class DeliveryRequestsService {
  private readonly logger = new Logger(DeliveryRequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly deliveryPlansService: DeliveryPlansService,
  ) {}

  async findAll(user: RequestUser): Promise<DeliveryRequestListItemResponseDto[]> {
    let pointIds: number[] | undefined;

    if (user.role !== 'admin') {
      const permissions = await this.prisma.user_permissions.findMany({
        where: {
          user_id: user.id,
          resource_type: ResourceType.Point,
          permissions: { has: PermissionLevel.Read },
        },
        select: { resource_id: true },
      });

      pointIds = permissions.map((p) => p.resource_id);
      if (pointIds.length === 0) return [];
    }

    const rows = await this.prisma.delivery_requests.findMany({
      where: {
        status: RequestStatus.Active,
        ...(pointIds && { point_id: { in: pointIds } }),
      },
      include: { products: true, points: { select: { id: true, name: true } } },
      orderBy: { created_at: 'desc' },
    });

    return rows.map((r) => toDeliveryRequestListItem(r));
  }

  async create(pointId: number, dto: CreateDeliveryRequestDto): Promise<DeliveryRequestResponseDto> {
    await Promise.all([this.validatePointExists(pointId), this.validateProductExists(dto.productId)]);

    const request = await this.prisma.delivery_requests.create({
      data: {
        point_id: pointId,
        product_id: dto.productId,
        quantity: dto.quantity,
        criticality: dto.criticality,
      },
      include: { products: true },
    });

    this.deliveryPlansService.recalculateAll().catch((err) => this.logger.error('Failed to recalculate delivery plans', err));

    return toDeliveryRequest(request);
  }

  async update(pointId: number, requestId: number, dto: UpdateDeliveryRequestDto): Promise<DeliveryRequestResponseDto> {
    if (dto.productId === undefined && dto.quantity === undefined && dto.criticality === undefined) {
      throw new BadRequestException('At least one field (productId, quantity or criticality) must be provided');
    }

    if (dto.productId) {
      await this.validateProductExists(dto.productId);
    }

    const existing = await this.prisma.delivery_requests.findFirst({
      where: { id: requestId, point_id: pointId },
    });
    if (!existing) {
      throw new NotFoundException('Delivery request not found');
    }

    const updated = await this.prisma.delivery_requests.update({
      where: { id: requestId },
      data: {
        ...(dto.productId !== undefined && { product_id: dto.productId }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.criticality !== undefined && { criticality: dto.criticality }),
      },
      include: { products: true },
    });

    this.deliveryPlansService.recalculateAll().catch((err) => this.logger.error('Failed to recalculate delivery plans', err));

    return toDeliveryRequest(updated);
  }

  async remove(pointId: number, requestId: number): Promise<void> {
    const existing = await this.prisma.delivery_requests.findFirst({
      where: { id: requestId, point_id: pointId },
    });
    if (!existing) {
      throw new NotFoundException('Delivery request not found');
    }

    await this.prisma.delivery_requests.delete({
      where: { id: requestId },
    });

    this.deliveryPlansService.recalculateAll().catch((err) => this.logger.error('Failed to recalculate delivery plans', err));
  }

  private async validatePointExists(pointId: number): Promise<void> {
    const point = await this.prisma.points.findUnique({
      where: { id: pointId },
      select: { id: true },
    });
    if (!point) {
      throw new NotFoundException('Point not found');
    }
  }

  private async validateProductExists(productId: number): Promise<void> {
    const product = await this.prisma.products.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }
}
