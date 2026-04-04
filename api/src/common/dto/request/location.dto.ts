import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class LocationDto {
  @ApiProperty({ example: 50.45, description: 'Latitude' })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 30.52, description: 'Longitude' })
  @IsNumber()
  lng: number;
}
