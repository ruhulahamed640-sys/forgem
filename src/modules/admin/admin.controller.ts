import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { UpdateSystemSettingDto, UpdateUserStatusDto } from './dto/admin.dto';
import {
  CreateRewardCatalogDto,
  UpdateRewardCatalogDto,
} from '../rewards/dto/reward.dto';

@ApiTags('Administration')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Retrieve administrative platform overview metrics' })
  getDashboard() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('users')
  @ApiOperation({ summary: 'List platform users with roles, profile, and points' })
  listUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.listUsers(Number(page || 1), Number(limit || 25));
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Inspect detailed user record and subscription state' })
  getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Suspend, reactivate, or deactivate a user account and record audit log' })
  updateUserStatus(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(admin.id, id, dto);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Retrieve system-wide AI, study time, and gamification analytics' })
  getAnalytics() {
    return this.adminService.getPlatformAnalytics();
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Retrieve full administrative leaderboard view' })
  getLeaderboard() {
    return this.adminService.getAdminLeaderboard();
  }

  @Get('rewards')
  @ApiOperation({ summary: 'List reward catalog items and server-side point rules' })
  getRewards() {
    return this.adminService.listRewardsAndRules();
  }

  @Post('rewards')
  @ApiOperation({ summary: 'Create a new reward catalog item and record administrative audit log' })
  createReward(
    @CurrentUser() admin: AuthenticatedUser,
    @Body() dto: CreateRewardCatalogDto,
  ) {
    return this.adminService.createReward(admin.id, dto);
  }

  @Patch('rewards/:id')
  @ApiOperation({ summary: 'Update reward catalog cost or stock quantity' })
  updateReward(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateRewardCatalogDto,
  ) {
    return this.adminService.updateReward(admin.id, id, dto);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Retrieve immutable security and administrative audit logs' })
  getAuditLogs() {
    return this.adminService.listAuditLogs();
  }

  @Get('settings')
  @ApiOperation({ summary: 'Retrieve global system settings and feature flags' })
  getSettings() {
    return this.adminService.listSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update a global system setting and record audit log' })
  updateSettings(
    @CurrentUser() admin: AuthenticatedUser,
    @Body() dto: UpdateSystemSettingDto,
  ) {
    return this.adminService.updateSetting(admin.id, dto);
  }
}
