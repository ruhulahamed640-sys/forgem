import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import {
  CreateChapterDto,
  CreateTopicDto,
  UpdateChapterDto,
} from './dto/chapter.dto';

@ApiTags('Chapters & Topics')
@ApiBearerAuth()
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a chapter within a subject and update subject progress' })
  createChapter(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateChapterDto) {
    return this.chaptersService.createChapter(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a chapter, including reordering it within its subject' })
  updateChapter(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateChapterDto,
  ) {
    return this.chaptersService.updateChapter(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chapter and its topics, then recalculate subject progress' })
  deleteChapter(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.chaptersService.deleteChapter(user.id, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark chapter completed and recalculate subject completion percentage' })
  completeChapter(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.chaptersService.completeChapter(user.id, id, true);
  }

  @Post(':id/uncomplete')
  @ApiOperation({ summary: 'Mark chapter incomplete and recalculate subject completion percentage' })
  uncompleteChapter(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.chaptersService.completeChapter(user.id, id, false);
  }

  @Post('topics')
  @ApiOperation({ summary: 'Create a topic under a chapter' })
  createTopic(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTopicDto) {
    return this.chaptersService.createTopic(user.id, dto);
  }
}
