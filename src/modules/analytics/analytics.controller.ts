import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Retrieve comprehensive student productivity and academic dashboard overview' })
  getOverview(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getOverview(user.id);
  }

  @Get('study-time')
  @ApiOperation({ summary: 'Retrieve 30-day study time and break breakdown' })
  getStudyTime(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getStudyTimeAnalytics(user.id);
  }

  @Get('subject-progress')
  @ApiOperation({ summary: 'Retrieve completion percentage and study time per subject' })
  getSubjectProgress(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getSubjectProgressAnalytics(user.id);
  }

  @Get('assignment-performance')
  @ApiOperation({ summary: 'Retrieve assignment completion and on-time submission metrics' })
  getAssignmentPerformance(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getAssignmentPerformance(user.id);
  }

  @Get('exam-performance')
  @ApiOperation({ summary: 'Retrieve historical examination scores and subject mark trends' })
  getExamPerformance(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getExamPerformance(user.id);
  }

  @Get('weekly-report')
  @ApiOperation({ summary: 'Retrieve consolidated weekly academic & productivity report' })
  getWeeklyReport(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getWeeklyReport(user.id);
  }
}
