import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-42' })
  id: string;

  @ApiProperty({ example: 'user@example.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: 'John', nullable: true })
  displayName: string | null;

  @ApiProperty({ example: 'admin' })
  role: string;
}
