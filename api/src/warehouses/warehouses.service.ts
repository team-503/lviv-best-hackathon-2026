import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { StockItemDto } from '../common/dto/request/stock-item.dto';
import type { StockUpdatedResponseDto } from '../common/dto/response/stock-updated.response.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateWarehouseDto } from './dto/request/create-warehouse.dto';
import type { UpdateWarehouseDto } from './dto/request/update-warehouse.dto';
import type { WarehouseDetailResponseDto } from './dto/response/warehouse-detail.response.dto';
import type { WarehouseListItemResponseDto } from './dto/response/warehouse-list-item.response.dto';
import type { WarehouseResponseDto } from './dto/response/warehouse.response.dto';
import type { WarehouseRow } from './types/warehouse-row.type';
import type { WarehouseWithPermissionsRow } from './types/warehouse-with-permissions-row.type';
import { toStockItem, toWarehouseBase, toWarehouseListItem } from './warehouses.helper';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<WarehouseListItemResponseDto[]> {
    const rows = await this.prisma.$queryRaw<WarehouseWithPermissionsRow[]>`
      SELECT
        w.id,
        w.name,
        ST_Y(w.location::geometry) AS lat,
        ST_X(w.location::geometry) AS lng,
        up.permissions
      FROM warehouses w
      LEFT JOIN user_permissions up
        ON up.resource_type = 'warehouse'
        AND up.resource_id = w.id
        AND up.user_id = ${userId}::uuid
      ORDER BY w.id
    `;

    return rows.map((r) => toWarehouseListItem(r));
  }

  async findOne(id: number): Promise<WarehouseDetailResponseDto> {
    return this.findOneWithClient(this.prisma, id);
  }

  async create(data: CreateWarehouseDto): Promise<WarehouseDetailResponseDto> {
    const { name, location, stock } = data;

    return this.prisma.$transaction(async (tx) => {
      const [inserted] = await tx.$queryRaw<{ id: number }[]>`
        INSERT INTO warehouses (name, location)
        VALUES (${name}, ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326)::geography)
        RETURNING id
      `;

      if (stock?.length) {
        await tx.warehouse_stock.createMany({
          data: stock.map((s) => ({
            warehouse_id: inserted.id,
            product_id: s.productId,
            quantity: s.quantity,
          })),
        });
      }

      return this.findOneWithClient(tx, inserted.id);
    });
  }

  async update(id: number, data: UpdateWarehouseDto): Promise<WarehouseResponseDto> {
    const { name, location } = data;

    if (!name && !location) {
      throw new BadRequestException('At least one field (name or location) must be provided');
    }

    const rows = await this.prisma.$queryRaw<WarehouseRow[]>`
      UPDATE warehouses
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
      throw new NotFoundException('Warehouse not found');
    }

    return toWarehouseBase(rows[0]);
  }

  async remove(id: number): Promise<void> {
    const count = await this.prisma.$executeRaw`
      DELETE FROM warehouses WHERE id = ${id}
    `;

    if (count === 0) {
      throw new NotFoundException('Warehouse not found');
    }
  }

  async updateStock(warehouseId: number, items: StockItemDto[]): Promise<StockUpdatedResponseDto> {
    if (items.length > 0) {
      const values = Prisma.join(items.map((i) => Prisma.sql`(${warehouseId}, ${i.productId}, ${i.quantity})`));

      await this.prisma.$executeRaw`
        INSERT INTO warehouse_stock (warehouse_id, product_id, quantity)
        VALUES ${values}
        ON CONFLICT (warehouse_id, product_id)
        DO UPDATE SET quantity = EXCLUDED.quantity
      `;
    }

    return { updated: items.length };
  }

  private async findOneWithClient(
    client: Prisma.TransactionClient | PrismaService,
    id: number,
  ): Promise<WarehouseDetailResponseDto> {
    const [rows, stockRows] = await Promise.all([
      client.$queryRaw<WarehouseRow[]>`
        SELECT w.id, w.name, ST_Y(w.location::geometry) AS lat, ST_X(w.location::geometry) AS lng
        FROM warehouses w WHERE w.id = ${id}
      `,
      client.warehouse_stock.findMany({
        where: { warehouse_id: id },
        include: { products: true },
      }),
    ]);

    if (rows.length === 0) {
      throw new NotFoundException('Warehouse not found');
    }

    return {
      ...toWarehouseBase(rows[0]),
      stock: stockRows.map((s) => toStockItem(s)),
    };
  }
}
