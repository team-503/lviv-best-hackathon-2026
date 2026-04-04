import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Fuel', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
