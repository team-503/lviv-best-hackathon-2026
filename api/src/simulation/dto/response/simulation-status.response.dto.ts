import { ApiProperty } from '@nestjs/swagger';
import { SimulationStatus } from '../../../common/enums/simulation-status.enum';

export class SimulationStatusResponseDto {
  @ApiProperty({ enum: SimulationStatus, description: 'Current simulation status', example: SimulationStatus.Idle })
  status: SimulationStatus;

  @ApiProperty({ description: 'Current simulation day', example: 1 })
  day: number;
}
