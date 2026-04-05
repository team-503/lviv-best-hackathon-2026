import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { FindNearestForPointDto } from './dto/request/find-nearest-for-point.dto';
import { FindNearestDto } from './dto/request/find-nearest.dto';
import { NearestLocationResponseDto } from './dto/response/nearest-location.response.dto';
import { ProductNearestLocationsResponseDto } from './dto/response/product-nearest-locations.response.dto';
import { GeoService } from './geo.service';

@ApiTags('geo')
@Controller('geo')
@Auth()
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('nearest')
  @ApiOperation({ summary: 'Find nearest locations with a specific product in stock' })
  @ApiResponse({ status: 200, description: 'Nearest locations ordered by distance', type: [NearestLocationResponseDto] })
  findNearest(@Query() dto: FindNearestDto): Promise<NearestLocationResponseDto[]> {
    return this.geoService.findNearestLocationsWithProduct(dto.lat, dto.lng, dto.productId, dto.limit);
  }

  @Get('nearest-for-point/:pointId')
  @ApiOperation({ summary: 'Find nearest locations for all products at a point' })
  @ApiResponse({ status: 200, description: 'Nearest locations grouped by product', type: [ProductNearestLocationsResponseDto] })
  findNearestForPoint(
    @Param('pointId', ParseIntPipe) pointId: number,
    @Query() dto: FindNearestForPointDto,
  ): Promise<ProductNearestLocationsResponseDto[]> {
    return this.geoService.findNearestForPoint(pointId, dto.limit);
  }
}
