import { ApiProperty } from '@nestjs/swagger';
import { AuthUserResponseDto } from './auth-user.response.dto';

export class AuthResponseDto {
  @ApiProperty({ type: AuthUserResponseDto, description: 'Дані користувача' })
  user: AuthUserResponseDto;
}
