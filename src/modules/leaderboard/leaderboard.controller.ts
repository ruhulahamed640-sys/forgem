import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';

@ApiTags('Leaderboard')
@ApiBearerAuth()
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Retrieve daily leaderboard rankings (UTC day boundary)' })
  getDaily() {
    return this.leaderboardService.getLeaderboard('DAILY');
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Retrieve weekly leaderboard rankings (ISO Monday boundary)' })
  getWeekly() {
    return this.leaderboardService.getLeaderboard('WEEKLY');
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Retrieve monthly leaderboard rankings' })
  getMonthly() {
    return this.leaderboardService.getLeaderboard('MONTHLY');
  }

  @Get('all-time')
  @ApiOperation({ summary: 'Retrieve all-time leaderboard rankings' })
  getAllTime() {
    return this.leaderboardService.getLeaderboard('ALL_TIME');
  }

  @Get('me')
  @ApiOperation({ summary: 'Retrieve current user rank and points across all leaderboard periods' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.leaderboardService.getMyStanding(user.id);
  }
}
