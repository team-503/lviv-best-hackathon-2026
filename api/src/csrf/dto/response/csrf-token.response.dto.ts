import { ApiProperty } from '@nestjs/swagger';

export class CsrfTokenResponseDto {
  @ApiProperty({ description: 'CSRF token', example: 'a1b2c3d4e5f6...' })
  token: string;
}
