import { ApiProperty } from '@nestjs/swagger';
import { SimulationStatus } from '../../../common/enums/simulation-status.enum';
import { PlanWithRoutesResponseDto } from '../../../delivery-plans/dto/response/plan-with-routes.response.dto';

export class SimulationAdvanceResponseDto {
  @ApiProperty({ enum: SimulationStatus, description: 'Previous simulation status', example: SimulationStatus.Idle })
  previousStatus: SimulationStatus;

  @ApiProperty({ enum: SimulationStatus, description: 'New simulation status', example: SimulationStatus.Stage1 })
  newStatus: SimulationStatus;

  @ApiProperty({ description: 'Current simulation day', example: 1 })
  day: number;

  @ApiProperty({
    type: PlanWithRoutesResponseDto,
    nullable: true,
    description: 'Executed plan details, null when transitioning stage2 → idle',
  })
  executedPlan: PlanWithRoutesResponseDto | null;
}
