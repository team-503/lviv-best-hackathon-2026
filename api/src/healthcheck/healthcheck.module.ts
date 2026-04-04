import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthcheckController } from './healthcheck.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthcheckController],
})
export class HealthcheckModule {}
