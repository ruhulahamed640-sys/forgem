import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';

@ApiTags('Notes & Resources')
@ApiBearerAuth()
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'List or search personal study notes' })
  list(@CurrentUser() user: AuthenticatedUser, @Query('q') q?: string) {
    return this.notesService.listNotes(user.id, q);
  }

  @Post()
  @ApiOperation({ summary: 'Create a personal study note' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: any) {
    return this.notesService.createNote(user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a personal study note with ownership check' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notesService.deleteNote(user.id, id);
  }
}
