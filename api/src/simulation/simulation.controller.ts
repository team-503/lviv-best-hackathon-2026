import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthLevel } from '../common/enums/auth-level.enum';
import { SimulationAdvanceResponseDto } from './dto/response/simulation-advance.response.dto';
import { SimulationStatusResponseDto } from './dto/response/simulation-status.response.dto';
import { SimulationService } from './simulation.service';

@ApiTags('simulation')
@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Get('status')
  @Auth()
  @ApiOperation({ summary: 'Get simulation status' })
  @ApiResponse({ status: 200, type: SimulationStatusResponseDto })
  getStatus(): Promise<SimulationStatusResponseDto> {
    return this.simulationService.getStatus();
  }

  @Post('advance')
  @Auth(AuthLevel.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Advance simulation to next stage (admin)' })
  @ApiResponse({ status: 200, type: SimulationAdvanceResponseDto })
  advance(): Promise<SimulationAdvanceResponseDto> {
    return this.simulationService.advance();
  }
}
