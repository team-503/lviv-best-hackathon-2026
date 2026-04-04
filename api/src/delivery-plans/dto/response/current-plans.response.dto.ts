import { ApiProperty } from '@nestjs/swagger';
import { PlanWithRoutesResponseDto } from './plan-with-routes.response.dto';

export class CurrentPlansResponseDto {
  @ApiProperty({ type: PlanWithRoutesResponseDto, description: 'Urgent plan (stage 1)', nullable: true })
  urgent: PlanWithRoutesResponseDto | null;

  @ApiProperty({ type: PlanWithRoutesResponseDto, description: 'Standard plan (stage 2)', nullable: true })
  standard: PlanWithRoutesResponseDto | null;
}
