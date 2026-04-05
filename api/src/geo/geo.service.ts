import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_LIMIT } from './constants';
import type { NearestLocationResponseDto } from './dto/response/nearest-location.response.dto';
import type { NearestPointResponseDto } from './dto/response/nearest-point.response.dto';
import type { NearestWarehouseResponseDto } from './dto/response/nearest-warehouse.response.dto';
import { toNearestLocation, toNearestPoint, toNearestWarehouse } from './geo.helper';
import type { NearestPointRow } from './types/nearest-point-row.type';
import type { NearestWarehouseRow } from './types/nearest-warehouse-row.type';

@Injectable()
export class GeoService {
  constructor(private readonly prisma: PrismaService) {}

  async findNearestWarehousesWithProduct(
    lat: number,
    lng: number,
    productId: number,
    limit: number = DEFAULT_LIMIT,
  ): Promise<NearestWarehouseResponseDto[]> {
    const rows = await this.prisma.$queryRaw<NearestWarehouseRow[]>`
      SELECT
        w.id,
        w.name,
        ST_Y(w.location::geometry) AS lat,
        ST_X(w.location::geometry) AS lng,
        ST_Distance(
          w.location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) AS distance_meters,
        ws.product_id,
        p.name AS product_name,
        ws.quantity
      FROM warehouses w
      JOIN warehouse_stock ws ON ws.warehouse_id = w.id
      JOIN products p ON p.id = ws.product_id
      WHERE ws.product_id = ${productId}
        AND ws.quantity > 0
        AND w.archived = false
      ORDER BY distance_meters
      LIMIT ${limit}
    `;

    return rows.map((r) => toNearestWarehouse(r));
  }

  async findNearestPointsWithSurplus(
    lat: number,
    lng: number,
    productId: number,
    minSurplus: number = 1,
    limit: number = DEFAULT_LIMIT,
  ): Promise<NearestPointResponseDto[]> {
    const rows = await this.prisma.$queryRaw<NearestPointRow[]>`
      SELECT
        pt.id,
        pt.name,
        ST_Y(pt.location::geometry) AS lat,
        ST_X(pt.location::geometry) AS lng,
        ST_Distance(
          pt.location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) AS distance_meters,
        ps.product_id,
        p.name AS product_name,
        ps.quantity,
        ps.min_threshold,
        (ps.quantity - ps.min_threshold) AS surplus
      FROM points pt
      JOIN point_stock ps ON ps.point_id = pt.id
      JOIN products p ON p.id = ps.product_id
      WHERE ps.product_id = ${productId}
        AND (ps.quantity - ps.min_threshold) >= ${minSurplus}
        AND pt.archived = false
      ORDER BY distance_meters
      LIMIT ${limit}
    `;

    return rows.map((r) => toNearestPoint(r));
  }

  async calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): Promise<number> {
    const [result] = await this.prisma.$queryRaw<{ distance_meters: number }[]>`
      SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint(${lng1}, ${lat1}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lng2}, ${lat2}), 4326)::geography
      ) AS distance_meters
    `;

    return result.distance_meters;
  }

  async findNearestLocationsWithProduct(
    lat: number,
    lng: number,
    productId: number,
    limit: number = DEFAULT_LIMIT,
  ): Promise<NearestLocationResponseDto[]> {
    const rows = await this.prisma.$queryRaw<(NearestPointRow & { location_type: string })[]>`
      (
        SELECT
          'warehouse' AS location_type,
          w.id,
          w.name,
          ST_Y(w.location::geometry) AS lat,
          ST_X(w.location::geometry) AS lng,
          ST_Distance(
            w.location,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) AS distance_meters,
          ws.product_id,
          p.name AS product_name,
          ws.quantity,
          0 AS min_threshold,
          ws.quantity AS surplus
        FROM warehouses w
        JOIN warehouse_stock ws ON ws.warehouse_id = w.id
        JOIN products p ON p.id = ws.product_id
        WHERE ws.product_id = ${productId}
          AND ws.quantity > 0
          AND w.archived = false
      )
      UNION ALL
      (
        SELECT
          'point' AS location_type,
          pt.id,
          pt.name,
          ST_Y(pt.location::geometry) AS lat,
          ST_X(pt.location::geometry) AS lng,
          ST_Distance(
            pt.location,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) AS distance_meters,
          ps.product_id,
          p.name AS product_name,
          ps.quantity,
          ps.min_threshold,
          (ps.quantity - ps.min_threshold) AS surplus
        FROM points pt
        JOIN point_stock ps ON ps.point_id = pt.id
        JOIN products p ON p.id = ps.product_id
        WHERE ps.product_id = ${productId}
          AND (ps.quantity - ps.min_threshold) > 0
          AND pt.archived = false
      )
      ORDER BY distance_meters
      LIMIT ${limit}
    `;

    return rows.map((r) => toNearestLocation(r));
  }
}
