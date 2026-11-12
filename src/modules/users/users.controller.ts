import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { UpdateProfileDto, UpdateSettingsDto } from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retrieve current user profile, academic metadata, and points summary' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMyProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile fields' })
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMyProfile(user.id, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Deactivate and soft-delete current user account and revoke all sessions' })
  deleteMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.softDeleteMyAccount(user.id);
  }

  @Get('me/settings')
  @ApiOperation({ summary: 'Retrieve user productivity, Pomodoro, and spaced-repetition settings' })
  getSettings(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMySettings(user.id);
  }

  @Patch('me/settings')
  @ApiOperation({ summary: 'Update user productivity, Pomodoro, and spaced-repetition settings' })
  updateSettings(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateSettingsDto) {
    return this.usersService.updateMySettings(user.id, dto);
  }
}
