import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { csrfUtilities } from './csrf.constants';
import { CsrfTokenResponseDto } from './dto/response/csrf-token.response.dto';

@Injectable()
export class CsrfService {
  getToken(req: Request, res: Response): CsrfTokenResponseDto {
    const token = csrfUtilities.generateCsrfToken(req, res);
    return { token };
  }
}
