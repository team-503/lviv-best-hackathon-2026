import { ApiProperty } from '@nestjs/swagger';
import { RouteStopResponseDto } from './route-stop.response.dto';

export class RouteResponseDto {
  @ApiProperty({ description: 'Route ID', example: 10 })
  id: number;

  @ApiProperty({ description: 'Vehicle number', example: 1 })
  vehicleNumber: number;

  @ApiProperty({ type: [RouteStopResponseDto], description: 'Ordered stops in the route' })
  stops: RouteStopResponseDto[];
}
