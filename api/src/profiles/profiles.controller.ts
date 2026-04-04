import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { RequestUser } from '../auth/auth.types';
import { Auth, AuthLevel, CurrentUser } from '../auth/decorators';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@Controller('profiles')
@Auth()
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: RequestUser) {
    return this.profileService.getProfile(user.id);
  }

  @Get('users')
  @Auth(AuthLevel.Admin)
  @ApiOperation({ summary: 'List all users' })
  getAllUsers() {
    return this.profileService.getAllUsers();
  }
}
