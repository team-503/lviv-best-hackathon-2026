import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import config from 'config';
import type { Request } from 'express';
import { AuthModule } from './auth/auth.module';
import { getSessionIdentifier } from './common/helpers/session-identifier';
import { HealthcheckModule } from './healthcheck/healthcheck.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      getTracker: (req) => getSessionIdentifier(req as unknown as Request),
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
    PrismaModule,
    AuthModule,
    ProfilesModule,
    ProductsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
