import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StudySessionsService } from './study-sessions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { CompleteStudySessionDto, StartStudySessionDto } from './dto/study-session.dto';

@ApiTags('Study Sessions')
@ApiBearerAuth()
@Controller('study-sessions')
export class StudySessionsController {
  constructor(private readonly studySessionsService: StudySessionsService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a server-timed study session (prevents concurrent active sessions)' })
  start(@CurrentUser() user: AuthenticatedUser, @Body() dto: StartStudySessionDto) {
    return this.studySessionsService.startSession(user.id, dto);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause an active study session and begin tracking break duration' })
  pause(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.studySessionsService.pauseSession(user.id, id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a paused study session and finalize break interval' })
  resume(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.studySessionsService.resumeSession(user.id, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete study session using server timestamps, update statistics, and evaluate points' })
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CompleteStudySessionDto,
  ) {
    return this.studySessionsService.completeSession(user.id, id, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Retrieve student study session logs and daily study statistics' })
  getHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.studySessionsService.getSessionHistory(user.id);
  }
}
