import { ApiProperty } from '@nestjs/swagger';
import { AuthUserResponseDto } from './auth-user.response.dto';

export class AuthResponseDto {
  @ApiProperty({ type: AuthUserResponseDto, description: 'User data' })
  user: AuthUserResponseDto;
}
