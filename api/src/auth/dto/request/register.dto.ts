import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: "Ім'я користувача", example: 'Іван Франко' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email користувача', example: 'user@logiflow.ua' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Пароль (мінімум 6 символів)', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: ['admin', 'warehouse', 'delivery'], description: 'Роль користувача', example: 'delivery' })
  @IsIn(['admin', 'warehouse', 'delivery'])
  role: string;
}
