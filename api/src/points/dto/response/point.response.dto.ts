import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from '../../../common/dto/request/location.dto';

export class PointResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Point 1' })
  name: string;

  @ApiProperty({ type: LocationDto })
  location: LocationDto;
}
