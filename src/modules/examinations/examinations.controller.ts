import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExaminationsService } from './examinations.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { CreateExamDto, RecordExamResultsDto } from './dto/examination.dto';

@ApiTags('Examinations')
@ApiBearerAuth()
@Controller('exams')
export class ExaminationsController {
  constructor(private readonly examinationsService: ExaminationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all examinations and schedules for the student' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.examinationsService.listExams(user.id);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'List upcoming examinations ordered by start date' })
  listUpcoming(@CurrentUser() user: AuthenticatedUser) {
    return this.examinationsService.listUpcomingExams(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an examination with subject-wise schedules' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateExamDto) {
    return this.examinationsService.createExam(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve examination details, schedules, and results' })
  getOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.examinationsService.getExamById(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update examination metadata or dates' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: Partial<CreateExamDto>,
  ) {
    return this.examinationsService.updateExam(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an examination owned by the student' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.examinationsService.deleteExam(user.id, id);
  }

  @Post(':id/results')
  @ApiOperation({ summary: 'Record subject-wise marks and calculate overall grade and percentage' })
  recordResults(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: RecordExamResultsDto,
  ) {
    return this.examinationsService.recordResults(user.id, id, dto);
  }
}
