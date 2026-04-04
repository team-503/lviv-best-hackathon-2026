import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { RequestUser } from '../auth/auth.types';
import { Auth, AuthLevel, CurrentUser } from '../auth/decorators';
import { ProfileResponseDto } from './dto/response/profile.response.dto';
import { UserResponseDto } from './dto/response/user.response.dto';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@ApiBearerAuth()
@Controller('profiles')
@Auth()
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile', type: ProfileResponseDto })
  getProfile(@CurrentUser() user: RequestUser): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(user.id);
  }

  @Get('users')
  @Auth(AuthLevel.Admin)
  @ApiOperation({ summary: 'List all users (admin)' })
  @ApiResponse({ status: 200, description: 'All user profiles', type: [UserResponseDto] })
  getAllUsers(): Promise<UserResponseDto[]> {
    return this.profileService.getAllUsers();
  }
}
