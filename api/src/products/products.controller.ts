import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthLevel } from '../common/enums/auth-level.enum';
import { CreateProductDto } from './dto/request/create-product.dto';
import { ProductResponseDto } from './dto/response/product.response.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
@Auth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiResponse({ status: 200, description: 'Product catalog', type: [ProductResponseDto] })
  findAll(): Promise<ProductResponseDto[]> {
    return this.productsService.findAll();
  }

  @Post()
  @Auth(AuthLevel.Admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a product (admin)' })
  @ApiResponse({ status: 201, description: 'Created product', type: ProductResponseDto })
  create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.create(dto.name);
  }

  @Delete(':id')
  @Auth(AuthLevel.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product (admin)' })
  @ApiNoContentResponse({ description: 'Product deleted' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.remove(id);
  }
}
