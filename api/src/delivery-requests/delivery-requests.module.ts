import { Module } from '@nestjs/common';
import { DeliveryPlansModule } from '../delivery-plans/delivery-plans.module';
import { DeliveryRequestsController } from './delivery-requests.controller';
import { DeliveryRequestsService } from './delivery-requests.service';

@Module({
  imports: [DeliveryPlansModule],
  controllers: [DeliveryRequestsController],
  providers: [DeliveryRequestsService],
  exports: [DeliveryRequestsService],
})
export class DeliveryRequestsModule {}
