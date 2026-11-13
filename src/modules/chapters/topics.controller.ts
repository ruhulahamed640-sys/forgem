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
import { UpdateTopicDto } from './dto/chapter.dto';

@ApiTags('Chapters & Topics')
@ApiBearerAuth()
@Controller('topics')
export class TopicsController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update a topic, including reordering it within its chapter' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTopicDto,
  ) {
    return this.chaptersService.updateTopic(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a topic and recalculate subject progress' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.chaptersService.deleteTopic(user.id, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark a topic completed for the authenticated student' })
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.chaptersService.completeTopic(user.id, id, true);
  }

  @Post(':id/uncomplete')
  @ApiOperation({ summary: 'Mark a topic incomplete for the authenticated student' })
  uncomplete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.chaptersService.completeTopic(user.id, id, false);
  }
}
