import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { StockUpdatedResponseDto } from '../common/dto/response/stock-updated.response.dto';
import { toDeliveryRequest } from '../delivery-requests/delivery-requests.helper';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePointDto } from './dto/request/create-point.dto';
import type { UpdatePointStockItemDto } from './dto/request/update-point-stock-item.dto';
import type { UpdatePointDto } from './dto/request/update-point.dto';
import type { PointDetailResponseDto } from './dto/response/point-detail.response.dto';
import type { PointListItemResponseDto } from './dto/response/point-list-item.response.dto';
import type { PointResponseDto } from './dto/response/point.response.dto';
import { toPointBase, toPointListItem, toPointStockItem } from './points.helper';
import type { PointRow } from './types/point-row.type';
import type { PointWithPermissionsRow } from './types/point-with-permissions-row.type';

@Injectable()
export class PointsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<PointListItemResponseDto[]> {
    const rows = await this.prisma.$queryRaw<PointWithPermissionsRow[]>`
      SELECT
        p.id,
        p.name,
        ST_Y(p.location::geometry) AS lat,
        ST_X(p.location::geometry) AS lng,
        up.permissions
      FROM points p
      LEFT JOIN user_permissions up
        ON up.resource_type = 'point'
        AND up.resource_id = p.id
        AND up.user_id = ${userId}::uuid
      ORDER BY p.id
    `;

    return rows.map((r) => toPointListItem(r));
  }

  async findOne(id: number): Promise<PointDetailResponseDto> {
    return this.findOneWithClient(this.prisma, id);
  }

  async create(data: CreatePointDto): Promise<PointDetailResponseDto> {
    const { name, location, stock } = data;

    return this.prisma.$transaction(async (tx) => {
      const [inserted] = await tx.$queryRaw<{ id: number }[]>`
        INSERT INTO points (name, location)
        VALUES (${name}, ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326)::geography)
        RETURNING id
      `;

      if (stock?.length) {
        await tx.point_stock.createMany({
          data: stock.map((s) => ({
            point_id: inserted.id,
            product_id: s.productId,
            quantity: s.quantity,
            min_threshold: s.minThreshold,
          })),
        });
      }

      return this.findOneWithClient(tx, inserted.id);
    });
  }

  async update(id: number, data: UpdatePointDto): Promise<PointResponseDto> {
    const { name, location } = data;

    if (!name && !location) {
      throw new BadRequestException('At least one field (name or location) must be provided');
    }

    const rows = await this.prisma.$queryRaw<PointRow[]>`
      UPDATE points
      SET
        name = COALESCE(${name ?? null}, name),
        location = COALESCE(
          ${location ? Prisma.sql`ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326)::geography` : Prisma.sql`NULL`},
          location
        )
      WHERE id = ${id}
      RETURNING id, name, ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng
    `;

    if (rows.length === 0) {
      throw new NotFoundException('Point not found');
    }

    return toPointBase(rows[0]);
  }

  async remove(id: number): Promise<void> {
    const count = await this.prisma.$executeRaw`
      DELETE FROM points WHERE id = ${id}
    `;

    if (count === 0) {
      throw new NotFoundException('Point not found');
    }
  }

  async updateStock(pointId: number, items: UpdatePointStockItemDto[]): Promise<StockUpdatedResponseDto> {
    if (items.length > 0) {
      const values = Prisma.join(items.map((i) => Prisma.sql`(${pointId}, ${i.productId}, 0, ${i.minThreshold})`));

      await this.prisma.$executeRaw`
        INSERT INTO point_stock (point_id, product_id, quantity, min_threshold)
        VALUES ${values}
        ON CONFLICT (point_id, product_id)
        DO UPDATE SET min_threshold = EXCLUDED.min_threshold
      `;
    }

    return { updated: items.length };
  }

  private async findOneWithClient(client: Prisma.TransactionClient | PrismaService, id: number): Promise<PointDetailResponseDto> {
    const [rows, stockRows, requestRows] = await Promise.all([
      client.$queryRaw<PointRow[]>`
        SELECT p.id, p.name, ST_Y(p.location::geometry) AS lat, ST_X(p.location::geometry) AS lng
        FROM points p WHERE p.id = ${id}
      `,
      client.point_stock.findMany({
        where: { point_id: id },
        include: { products: true },
      }),
      client.delivery_requests.findMany({
        where: { point_id: id, status: 'active' },
        include: { products: true },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    if (rows.length === 0) {
      throw new NotFoundException('Point not found');
    }

    return {
      ...toPointBase(rows[0]),
      stock: stockRows.map((s) => toPointStockItem(s)),
      deliveryRequests: requestRows.map((r) => toDeliveryRequest(r)),
    };
  }
}
