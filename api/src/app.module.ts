import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import config from 'config';
import { AuthModule } from './auth/auth.module';
import { getSessionIdentifier } from './common/helpers/session-identifier';
import { HealthcheckModule } from './healthcheck/healthcheck.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    PrismaModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
