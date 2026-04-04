import { Module } from '@nestjs/common';
import { DeliveryPlansModule } from '../delivery-plans/delivery-plans.module';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';

@Module({
  imports: [DeliveryPlansModule],
  controllers: [SimulationController],
  providers: [SimulationService],
})
export class SimulationModule {}
