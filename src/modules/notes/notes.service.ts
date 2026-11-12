import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async listNotes(userId: string, search?: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        isArchived: false,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { folder: true, subject: true },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async createNote(
    userId: string,
    dto: { title: string; content: string; subjectId?: string; folderId?: string; tags?: string[] },
  ) {
    return this.prisma.note.create({
      data: {
        userId,
        title: dto.title.trim(),
        content: dto.content,
        subjectId: dto.subjectId,
        folderId: dto.folderId,
        tags: dto.tags || [],
      },
    });
  }

  async deleteNote(userId: string, noteId: string) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== userId) throw new ForbiddenException('Not your note');
    await this.prisma.note.delete({ where: { id: noteId } });
    return { deleted: true, id: noteId };
  }
}
