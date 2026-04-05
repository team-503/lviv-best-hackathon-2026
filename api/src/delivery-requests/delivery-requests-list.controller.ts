import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { RequestUser } from '../auth/auth.types';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DeliveryRequestsService } from './delivery-requests.service';
import { DeliveryRequestListItemResponseDto } from './dto/response/delivery-request-list-item.response.dto';

@ApiTags('delivery-requests')
@Controller('delivery-requests')
export class DeliveryRequestsListController {
  constructor(private readonly deliveryRequestsService: DeliveryRequestsService) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List all active delivery requests (read)' })
  @ApiResponse({
    status: 200,
    description: 'Active delivery requests for accessible points',
    type: [DeliveryRequestListItemResponseDto],
  })
  findAll(@CurrentUser() user: RequestUser): Promise<DeliveryRequestListItemResponseDto[]> {
    return this.deliveryRequestsService.findAll(user);
  }
}
