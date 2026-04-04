import { ApiProperty } from '@nestjs/swagger';
import { RouteResponseDto } from './route.response.dto';

export class PlanWithRoutesResponseDto {
  @ApiProperty({ description: 'Plan ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Plan type', example: 'urgent' })
  type: string;

  @ApiProperty({ description: 'Plan status', example: 'draft' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp', example: '2026-04-04T08:00:00Z' })
  createdAt: Date;

  @ApiProperty({ type: [RouteResponseDto], description: 'Vehicle routes' })
  routes: RouteResponseDto[];
}
