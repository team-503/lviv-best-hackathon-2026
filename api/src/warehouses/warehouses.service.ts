import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { StockItemDto } from '../common/dto/request/stock-item.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateWarehouseDto } from './dto/request/create-warehouse.dto';
import type { UpdateWarehouseDto } from './dto/request/update-warehouse.dto';
import type { StockUpdatedResponseDto } from './dto/response/stock-updated.response.dto';
import type { WarehouseDetailResponseDto } from './dto/response/warehouse-detail.response.dto';
import type { WarehouseListItemResponseDto } from './dto/response/warehouse-list-item.response.dto';
import type { WarehouseResponseDto } from './dto/response/warehouse.response.dto';

interface WarehouseRow {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

interface WarehouseWithPermissionsRow extends WarehouseRow {
  permissions: string[] | null;
}

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

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      location: { lat: r.lat, lng: r.lng },
      permissions: r.permissions ?? null,
    }));
  }

  async findOne(id: number): Promise<WarehouseDetailResponseDto> {
    const rows = await this.prisma.$queryRaw<WarehouseRow[]>`
      SELECT
        w.id,
        w.name,
        ST_Y(w.location::geometry) AS lat,
        ST_X(w.location::geometry) AS lng
      FROM warehouses w
      WHERE w.id = ${id}
    `;
    if (rows.length === 0) {
      throw new NotFoundException('Warehouse not found');
    }

    const warehouse = rows[0];

    const stockRows = await this.prisma.warehouse_stock.findMany({
      where: { warehouse_id: id },
      include: { products: true },
    });

    return {
      id: warehouse.id,
      name: warehouse.name,
      location: { lat: warehouse.lat, lng: warehouse.lng },
      stock: stockRows.map((s) => ({
        product: { id: s.products.id, name: s.products.name },
        quantity: s.quantity,
      })),
    };
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

      return this.findOneInTransaction(tx, inserted.id);
    });
  }

  async update(id: number, data: UpdateWarehouseDto): Promise<WarehouseResponseDto> {
    const { name, location } = data;

    let count: number;

    if (name && location) {
      count = await this.prisma.$executeRaw`
        UPDATE warehouses
        SET name = ${name}, location = ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326)::geography
        WHERE id = ${id}
      `;
    } else if (name) {
      count = await this.prisma.$executeRaw`
        UPDATE warehouses SET name = ${name} WHERE id = ${id}
      `;
    } else if (location) {
      count = await this.prisma.$executeRaw`
        UPDATE warehouses
        SET location = ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326)::geography
        WHERE id = ${id}
      `;
    } else {
      throw new NotFoundException('Warehouse not found');
    }

    if (count === 0) {
      throw new NotFoundException('Warehouse not found');
    }

    const rows = await this.prisma.$queryRaw<WarehouseRow[]>`
      SELECT w.id, w.name, ST_Y(w.location::geometry) AS lat, ST_X(w.location::geometry) AS lng
      FROM warehouses w WHERE w.id = ${id}
    `;

    return {
      id: rows[0].id,
      name: rows[0].name,
      location: { lat: rows[0].lat, lng: rows[0].lng },
    };
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
    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.$executeRaw`
          INSERT INTO warehouse_stock (warehouse_id, product_id, quantity)
          VALUES (${warehouseId}, ${item.productId}, ${item.quantity})
          ON CONFLICT (warehouse_id, product_id)
          DO UPDATE SET quantity = EXCLUDED.quantity
        `;
      }
    });

    return { updated: items.length };
  }

  private async findOneInTransaction(tx: Prisma.TransactionClient, id: number): Promise<WarehouseDetailResponseDto> {
    const rows = await tx.$queryRaw<WarehouseRow[]>`
      SELECT w.id, w.name, ST_Y(w.location::geometry) AS lat, ST_X(w.location::geometry) AS lng
      FROM warehouses w WHERE w.id = ${id}
    `;

    const stockRows = await tx.warehouse_stock.findMany({
      where: { warehouse_id: id },
      include: { products: true },
    });

    return {
      id: rows[0].id,
      name: rows[0].name,
      location: { lat: rows[0].lat, lng: rows[0].lng },
      stock: stockRows.map((s) => ({
        product: { id: s.products.id, name: s.products.name },
        quantity: s.quantity,
      })),
    };
  }
}
