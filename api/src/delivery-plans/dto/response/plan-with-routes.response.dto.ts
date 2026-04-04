import { ApiProperty } from '@nestjs/swagger';
import { PlanListItemResponseDto } from './plan-list-item.response.dto';
import { RouteResponseDto } from './route.response.dto';

export class PlanWithRoutesResponseDto extends PlanListItemResponseDto {
  @ApiProperty({ type: [RouteResponseDto], description: 'Vehicle routes' })
  routes: RouteResponseDto[];
}
