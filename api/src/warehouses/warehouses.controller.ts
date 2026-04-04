import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { RequestUser } from '../auth/auth.types';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthLevel } from '../common/enums/auth-level.enum';
import { PermissionLevel } from '../common/enums/permission-level.enum';
import { ResourceType } from '../common/enums/resource-type.enum';
import { CreateWarehouseDto } from './dto/request/create-warehouse.dto';
import { UpdateStockDto } from './dto/request/update-stock.dto';
import { UpdateWarehouseDto } from './dto/request/update-warehouse.dto';
import { StockUpdatedResponseDto } from '../common/dto/response/stock-updated.response.dto';
import { WarehouseDetailResponseDto } from './dto/response/warehouse-detail.response.dto';
import { WarehouseListItemResponseDto } from './dto/response/warehouse-list-item.response.dto';
import { WarehouseResponseDto } from './dto/response/warehouse.response.dto';
import { WarehousesService } from './warehouses.service';

@ApiTags('warehouses')
@Controller('warehouses')
@Auth()
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @ApiOperation({ summary: 'List all warehouses for the map' })
  @ApiResponse({ status: 200, description: 'All warehouses with current user permissions', type: [WarehouseListItemResponseDto] })
  findAll(@CurrentUser() user: RequestUser): Promise<WarehouseListItemResponseDto[]> {
    return this.warehousesService.findAll(user.id);
  }

  @Get(':id')
  @Auth(PermissionLevel.Read, ResourceType.Warehouse)
  @ApiOperation({ summary: 'Get warehouse details with stock (read)' })
  @ApiResponse({ status: 200, description: 'Warehouse details including stock', type: WarehouseDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Warehouse not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<WarehouseDetailResponseDto> {
    return this.warehousesService.findOne(id);
  }

  @Patch(':id/stock')
  @Auth(PermissionLevel.Write, ResourceType.Warehouse)
  @ApiOperation({ summary: 'Update warehouse stock quantities (write)' })
  @ApiResponse({ status: 200, description: 'Number of updated stock items', type: StockUpdatedResponseDto })
  updateStock(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStockDto): Promise<StockUpdatedResponseDto> {
    return this.warehousesService.updateStock(id, dto.items);
  }

  @Post()
  @Auth(AuthLevel.Admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a warehouse (admin)' })
  @ApiResponse({ status: 201, description: 'Created warehouse with stock', type: WarehouseDetailResponseDto })
  create(@Body() dto: CreateWarehouseDto): Promise<WarehouseDetailResponseDto> {
    return this.warehousesService.create(dto);
  }

  @Put(':id')
  @Auth(AuthLevel.Admin)
  @ApiOperation({ summary: 'Update warehouse name and/or location (admin)' })
  @ApiResponse({ status: 200, description: 'Updated warehouse', type: WarehouseResponseDto })
  @ApiNotFoundResponse({ description: 'Warehouse not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWarehouseDto): Promise<WarehouseResponseDto> {
    return this.warehousesService.update(id, dto);
  }

  @Delete(':id')
  @Auth(AuthLevel.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a warehouse (admin)' })
  @ApiNoContentResponse({ description: 'Warehouse deleted' })
  @ApiNotFoundResponse({ description: 'Warehouse not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.warehousesService.remove(id);
  }
}
