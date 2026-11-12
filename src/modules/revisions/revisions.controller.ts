import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RevisionsService } from './revisions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { CompleteRevisionDto, CreateRevisionDto } from './dto/revision.dto';

@ApiTags('Revisions')
@ApiBearerAuth()
@Controller('revisions')
export class RevisionsController {
  constructor(private readonly revisionsService: RevisionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all spaced-repetition revision schedules and history' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.revisionsService.listRevisions(user.id);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'List upcoming due revision schedules' })
  listUpcoming(@CurrentUser() user: AuthenticatedUser) {
    return this.revisionsService.listUpcomingRevisions(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new revision schedule for a topic' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateRevisionDto) {
    return this.revisionsService.createRevision(user.id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a revision session and compute next interval via configured algorithm' })
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CompleteRevisionDto,
  ) {
    return this.revisionsService.completeRevision(user.id, id, dto);
  }
}
