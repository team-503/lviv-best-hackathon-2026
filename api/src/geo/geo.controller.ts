import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { FindNearestDto } from './dto/request/find-nearest.dto';
import { NearestLocationResponseDto } from './dto/response/nearest-location.response.dto';
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
}
