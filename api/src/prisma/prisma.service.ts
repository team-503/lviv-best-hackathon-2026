import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connection established.');
    } catch (error) {
      this.logger.warn(`Database unavailable at startup: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
