import { ApiProperty } from '@nestjs/swagger';

export class StopLocationResponseDto {
  @ApiProperty({ description: 'Location ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Location name', example: 'Warehouse A' })
  name: string;

  @ApiProperty({ description: 'Latitude', example: 50.45 })
  lat: number;

  @ApiProperty({ description: 'Longitude', example: 30.52 })
  lng: number;
}
