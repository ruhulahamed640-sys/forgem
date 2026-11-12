import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';
import { CreateChapterDto, CreateTopicDto } from './dto/chapter.dto';

@Injectable()
export class ChaptersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subjectsService: SubjectsService,
  ) {}

  async createChapter(userId: string, dto: CreateChapterDto) {
    await this.subjectsService.getSubjectById(userId, dto.subjectId);
    const chapter = await this.prisma.chapter.create({
      data: {
        subjectId: dto.subjectId,
        title: dto.title.trim(),
        orderIndex: dto.orderIndex,
        description: dto.description,
        estimatedMinutes: dto.estimatedMinutes || 60,
      },
    });
    await this.subjectsService.recalculateSubjectProgress(userId, dto.subjectId);
    return chapter;
  }

  async completeChapter(userId: string, chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true },
    });
    if (!chapter) throw new NotFoundException('Chapter not found');
    if (chapter.subject.userId !== userId) {
      throw new ForbiddenException('Access denied: you do not own this chapter');
    }
    const updated = await this.prisma.chapter.update({
      where: { id: chapterId },
      data: { isCompleted: true, completedAt: new Date() },
    });
    await this.subjectsService.recalculateSubjectProgress(userId, chapter.subjectId);
    return updated;
  }

  async createTopic(userId: string, dto: CreateTopicDto) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: dto.chapterId },
      include: { subject: true },
    });
    if (!chapter) throw new NotFoundException('Chapter not found');
    if (chapter.subject.userId !== userId) {
      throw new ForbiddenException('Access denied: you do not own this chapter');
    }
    const topic = await this.prisma.topic.create({
      data: {
        chapterId: dto.chapterId,
        title: dto.title.trim(),
        orderIndex: dto.orderIndex,
        difficultyLevel: dto.difficultyLevel || 3,
      },
    });
    await this.subjectsService.recalculateSubjectProgress(userId, chapter.subjectId);
    return topic;
  }
}
