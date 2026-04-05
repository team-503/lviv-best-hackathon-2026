import { Module } from '@nestjs/common';
import { DeliveryPlansModule } from '../delivery-plans/delivery-plans.module';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';

@Module({
  imports: [DeliveryPlansModule],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
