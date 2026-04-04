import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { DeliveryPlansService } from './delivery-plans.service';
import { CurrentPlansResponseDto } from './dto/response/current-plans.response.dto';
import { PlanListItemResponseDto } from './dto/response/plan-list-item.response.dto';
import { PlanWithRoutesResponseDto } from './dto/response/plan-with-routes.response.dto';

@ApiTags('delivery-plans')
@Auth()
@Controller('delivery-plans')
export class DeliveryPlansController {
  constructor(private readonly service: DeliveryPlansService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current active delivery plans' })
  @ApiResponse({ status: 200, type: CurrentPlansResponseDto })
  getCurrent(): Promise<CurrentPlansResponseDto> {
    return this.service.findCurrent();
  }

  @Get('history')
  @ApiOperation({ summary: 'Get completed plan history' })
  @ApiResponse({ status: 200, type: [PlanListItemResponseDto] })
  getHistory(): Promise<PlanListItemResponseDto[]> {
    return this.service.findHistory();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery plan by ID' })
  @ApiResponse({ status: 200, type: PlanWithRoutesResponseDto })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  getOne(@Param('id', ParseIntPipe) id: number): Promise<PlanWithRoutesResponseDto> {
    return this.service.findOne(id);
  }
}
