import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from '../../../products/dto/response/product.response.dto';

export class WarehouseStockItemResponseDto {
  @ApiProperty({ type: ProductResponseDto })
  product: ProductResponseDto;

  @ApiProperty({ example: 50 })
  quantity: number;
}
