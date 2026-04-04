import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthLevel } from '../common/enums/auth-level.enum';
import { CreatePermissionDto } from './dto/request/create-permission.dto';
import { UpdatePermissionDto } from './dto/request/update-permission.dto';
import { PermissionResponseDto } from './dto/response/permission.response.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('permissions')
@Controller('permissions')
@Auth(AuthLevel.Admin)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all permissions' })
  @ApiResponse({ status: 200, description: 'All user permissions', type: [PermissionResponseDto] })
  findAll(): Promise<PermissionResponseDto[]> {
    return this.permissionsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a permission' })
  @ApiResponse({ status: 201, description: 'Created permission', type: PermissionResponseDto })
  create(@Body() dto: CreatePermissionDto): Promise<PermissionResponseDto> {
    return this.permissionsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a permission' })
  @ApiResponse({ status: 200, description: 'Updated permission', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePermissionDto): Promise<PermissionResponseDto> {
    return this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiNoContentResponse({ description: 'Permission deleted' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.permissionsService.remove(id);
  }
}
