import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email користувача', example: 'admin@logiflow.ua' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Пароль', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
