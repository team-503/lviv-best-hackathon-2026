import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { RequestUser } from '../auth/auth.types';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StockUpdatedResponseDto } from '../common/dto/response/stock-updated.response.dto';
import { AuthLevel } from '../common/enums/auth-level.enum';
import { PermissionLevel } from '../common/enums/permission-level.enum';
import { ResourceType } from '../common/enums/resource-type.enum';
import { CreatePointDto } from './dto/request/create-point.dto';
import { UpdatePointStockDto } from './dto/request/update-point-stock.dto';
import { UpdatePointDto } from './dto/request/update-point.dto';
import { PointDetailResponseDto } from './dto/response/point-detail.response.dto';
import { PointListItemResponseDto } from './dto/response/point-list-item.response.dto';
import { PointResponseDto } from './dto/response/point.response.dto';
import { PointsService } from './points.service';

@ApiTags('points')
@Controller('points')
@Auth()
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get()
  @ApiOperation({ summary: 'List all points for the map' })
  @ApiResponse({ status: 200, description: 'All points with current user permissions', type: [PointListItemResponseDto] })
  findAll(@CurrentUser() user: RequestUser): Promise<PointListItemResponseDto[]> {
    return this.pointsService.findAll(user.id);
  }

  @Get(':id')
  @Auth(PermissionLevel.Read, ResourceType.Point)
  @ApiOperation({ summary: 'Get point details with stock and delivery requests (read)' })
  @ApiResponse({
    status: 200,
    description: 'Point details including stock and active delivery requests',
    type: PointDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Point not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PointDetailResponseDto> {
    return this.pointsService.findOne(id);
  }

  @Patch(':id/stock')
  @Auth(PermissionLevel.Write, ResourceType.Point)
  @ApiOperation({ summary: 'Update point stock minimum thresholds (read, write)' })
  @ApiResponse({ status: 200, description: 'Number of updated stock items', type: StockUpdatedResponseDto })
  updateStock(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePointStockDto): Promise<StockUpdatedResponseDto> {
    return this.pointsService.updateStock(id, dto.items);
  }

  @Post()
  @Auth(AuthLevel.Admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a point (admin)' })
  @ApiResponse({ status: 201, description: 'Created point with stock', type: PointDetailResponseDto })
  create(@Body() dto: CreatePointDto): Promise<PointDetailResponseDto> {
    return this.pointsService.create(dto);
  }

  @Put(':id')
  @Auth(AuthLevel.Admin)
  @ApiOperation({ summary: 'Update point name and/or location (admin)' })
  @ApiResponse({ status: 200, description: 'Updated point', type: PointResponseDto })
  @ApiNotFoundResponse({ description: 'Point not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePointDto): Promise<PointResponseDto> {
    return this.pointsService.update(id, dto);
  }

  @Delete(':id')
  @Auth(AuthLevel.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a point (admin)' })
  @ApiNoContentResponse({ description: 'Point deleted' })
  @ApiNotFoundResponse({ description: 'Point not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.pointsService.remove(id);
  }
}
