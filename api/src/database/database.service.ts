import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private initializationPromise: Promise<void> | null = null;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.attemptInitialize();
    } catch (err) {
      this.logger.warn(`Database unavailable at startup: ${(err as Error).message}. Will retry on first DB request.`);
    }
  }

  async ensureConnected(): Promise<void> {
    if (this.dataSource.isInitialized) return;

    if (!this.initializationPromise) {
      this.initializationPromise = this.attemptInitialize().finally(() => {
        this.initializationPromise = null;
      });
    }

    await this.initializationPromise;
  }

  private async attemptInitialize(): Promise<void> {
    this.logger.log('Attempting database initialization...');
    await this.dataSource.initialize();
    await this.dataSource.runMigrations();
    this.logger.log('Database connection established.');
  }
}
