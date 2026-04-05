import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({ example: 'uuid-42' })
  id: string;

  @ApiProperty({ example: 'user@example.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: 'Іван Франко', nullable: true })
  displayName: string | null;

  @ApiProperty({ example: 'admin' })
  role: string;
}
