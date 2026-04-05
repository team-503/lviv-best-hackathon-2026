import { Module } from '@nestjs/common';
import { DeliveryPlansModule } from '../delivery-plans/delivery-plans.module';
import { DeliveryRequestsListController } from './delivery-requests-list.controller';
import { DeliveryRequestsController } from './delivery-requests.controller';
import { DeliveryRequestsService } from './delivery-requests.service';

@Module({
  imports: [DeliveryPlansModule],
  controllers: [DeliveryRequestsListController, DeliveryRequestsController],
  providers: [DeliveryRequestsService],
  exports: [DeliveryRequestsService],
})
export class DeliveryRequestsModule {}
