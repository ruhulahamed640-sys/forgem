import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { CreateChapterDto, CreateTopicDto } from './dto/chapter.dto';

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

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark chapter completed and recalculate subject completion percentage' })
  completeChapter(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.chaptersService.completeChapter(user.id, id);
  }

  @Post('topics')
  @ApiOperation({ summary: 'Create a topic under a chapter' })
  createTopic(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTopicDto) {
    return this.chaptersService.createTopic(user.id, dto);
  }
}
