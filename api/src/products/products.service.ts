import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.products.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
  }

  async create(name: string) {
    const product = await this.prisma.products.create({ data: { name } });
    return { id: product.id, name: product.name };
  }

  async remove(id: number) {
    await this.prisma.products.delete({ where: { id } });
  }
}
