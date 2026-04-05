import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CsrfService } from './csrf.service';
import { CsrfTokenResponseDto } from './dto/response/csrf-token.response.dto';

@ApiTags('csrf')
@Controller('csrf')
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get('token')
  @ApiOperation({ summary: 'Get CSRF token' })
  @ApiResponse({ status: 200, type: CsrfTokenResponseDto })
  getToken(@Req() req: Request, @Res({ passthrough: true }) res: Response): CsrfTokenResponseDto {
    return this.csrfService.getToken(req, res);
  }
}
