import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from 'config';
import { getSessionIdentifier } from './common/helpers/session-identifier';
import { DatabaseModule } from './database/database.module';
import { HealthcheckModule } from './healthcheck/healthcheck.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      manualInitialization: true,
      migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    }),
    ThrottlerModule.forRoot({
      getTracker: getSessionIdentifier,
      throttlers: [
        {
          name: 'short',
          ...config.get('throttle.base.short'),
        },
        {
          name: 'medium',
          ...config.get('throttle.base.medium'),
        },
        {
          name: 'long',
          ...config.get('throttle.base.long'),
        },
      ],
    }),
    HealthcheckModule,
    DatabaseModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
