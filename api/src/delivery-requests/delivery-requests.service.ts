import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryPlansService } from '../delivery-plans/delivery-plans.service';
import { PrismaService } from '../prisma/prisma.service';
import { toDeliveryRequest } from './delivery-requests.helper';
import type { CreateDeliveryRequestDto } from './dto/request/create-delivery-request.dto';
import type { UpdateDeliveryRequestDto } from './dto/request/update-delivery-request.dto';
import type { DeliveryRequestResponseDto } from './dto/response/delivery-request.response.dto';

@Injectable()
export class DeliveryRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deliveryPlansService: DeliveryPlansService,
  ) {}

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

    void this.deliveryPlansService.recalculateAll();

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

    void this.deliveryPlansService.recalculateAll();

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

    void this.deliveryPlansService.recalculateAll();
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
