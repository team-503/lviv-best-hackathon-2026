import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ProductResponseDto } from './dto/response/product.response.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ProductResponseDto[]> {
    return this.prisma.products.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
  }

  async create(name: string): Promise<ProductResponseDto> {
    const product = await this.prisma.products.create({ data: { name } });
    return { id: product.id, name: product.name };
  }

  async remove(id: number): Promise<void> {
    await this.prisma.products.delete({ where: { id } });
  }
}
