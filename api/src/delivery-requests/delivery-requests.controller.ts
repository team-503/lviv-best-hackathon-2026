import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { PermissionLevel } from '../common/enums/permission-level.enum';
import { ResourceType } from '../common/enums/resource-type.enum';
import { DeliveryRequestsService } from './delivery-requests.service';
import { CreateDeliveryRequestDto } from './dto/request/create-delivery-request.dto';
import { UpdateDeliveryRequestDto } from './dto/request/update-delivery-request.dto';
import { DeliveryRequestResponseDto } from './dto/response/delivery-request.response.dto';

@ApiTags('delivery-requests')
@Controller('points/:id/delivery-requests')
export class DeliveryRequestsController {
  constructor(private readonly deliveryRequestsService: DeliveryRequestsService) {}

  @Post()
  @Auth(PermissionLevel.Write, ResourceType.Point)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a delivery request (write)' })
  @ApiResponse({ status: 201, description: 'Created delivery request', type: DeliveryRequestResponseDto })
  @ApiNotFoundResponse({ description: 'Point or product not found' })
  create(@Param('id', ParseIntPipe) pointId: number, @Body() dto: CreateDeliveryRequestDto): Promise<DeliveryRequestResponseDto> {
    return this.deliveryRequestsService.create(pointId, dto);
  }

  @Put(':requestId')
  @Auth(PermissionLevel.Write, ResourceType.Point)
  @ApiOperation({ summary: 'Update a delivery request (write)' })
  @ApiResponse({ status: 200, description: 'Updated delivery request', type: DeliveryRequestResponseDto })
  @ApiNotFoundResponse({ description: 'Delivery request or product not found' })
  update(
    @Param('id', ParseIntPipe) pointId: number,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() dto: UpdateDeliveryRequestDto,
  ): Promise<DeliveryRequestResponseDto> {
    return this.deliveryRequestsService.update(pointId, requestId, dto);
  }

  @Delete(':requestId')
  @Auth(PermissionLevel.Write, ResourceType.Point)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a delivery request (write)' })
  @ApiNoContentResponse({ description: 'Delivery request deleted' })
  @ApiNotFoundResponse({ description: 'Delivery request not found' })
  remove(@Param('id', ParseIntPipe) pointId: number, @Param('requestId', ParseIntPipe) requestId: number): Promise<void> {
    return this.deliveryRequestsService.remove(pointId, requestId);
  }
}
