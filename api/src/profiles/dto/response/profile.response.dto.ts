import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.response.dto';

export class ProfileResponseDto extends UserResponseDto {
  @ApiProperty({ example: '2026-04-01T10:00:00Z' })
  createdAt: Date;
}
