import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';

@ApiTags('Subjects')
@ApiBearerAuth()
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List all subjects owned by the authenticated student' })
  @ApiQuery({ name: 'archived', required: false, enum: ['false', 'true', 'all'] })
  @ApiQuery({ name: 'search', required: false, description: 'Case-insensitive name/code match' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('archived') archived?: string,
    @Query('search') search?: string,
  ) {
    return this.subjectsService.listSubjects(user.id, { archived, search });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new subject and initialize progress tracking' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateSubjectDto) {
    return this.subjectsService.createSubject(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve subject details with chapters, topics, and progress' })
  getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.subjectsService.getSubjectById(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update or archive a subject owned by the authenticated student' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectsService.updateSubject(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permanently delete a subject (and its chapters, topics, and progress)' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.subjectsService.deleteSubject(user.id, id);
  }
}
