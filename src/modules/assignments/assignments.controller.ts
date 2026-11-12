import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment.dto';

@ApiTags('Assignments')
@ApiBearerAuth()
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List assignments with pagination, filtering, and automatic overdue detection' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('subjectId') subjectId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.assignmentsService.listAssignments(user.id, {
      status,
      subjectId,
      page,
      limit,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new assignment and schedule deadline reminders' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.createAssignment(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve assignment details, submissions, and attachments' })
  getOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.assignmentsService.getAssignmentById(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update assignment details or progress' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.updateAssignment(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an assignment owned by the user' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.assignmentsService.deleteAssignment(user.id, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark assignment complete, record submission, award points, and evaluate achievements' })
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ) {
    return this.assignmentsService.completeAssignment(user.id, id, notes);
  }
}
