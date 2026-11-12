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
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.subjectsService.listSubjects(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new subject and initialize progress tracking' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateSubjectDto) {
    return this.subjectsService.createSubject(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve subject details with chapters, topics, and progress' })
  getOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.subjectsService.getSubjectById(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subject owned by the authenticated student' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectsService.updateSubject(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subject owned by the authenticated student' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.subjectsService.deleteSubject(user.id, id);
  }
}
