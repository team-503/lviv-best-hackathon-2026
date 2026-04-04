import { Module } from '@nestjs/common';
import { GeoModule } from '../geo/geo.module';
import { DeliveryPlansController } from './delivery-plans.controller';
import { DeliveryPlansService } from './delivery-plans.service';

@Module({
  imports: [GeoModule],
  controllers: [DeliveryPlansController],
  providers: [DeliveryPlansService],
  exports: [DeliveryPlansService],
})
export class DeliveryPlansModule {}
