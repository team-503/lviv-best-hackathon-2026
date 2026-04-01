import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthcheckController } from './healthcheck.controller';

@Module({
  imports: [TerminusModule, TypeOrmModule],
  controllers: [HealthcheckController],
})
export class HealthcheckModule {}
