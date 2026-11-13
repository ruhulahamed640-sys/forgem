import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';
import {
  CreateChapterDto,
  CreateTopicDto,
  UpdateChapterDto,
  UpdateTopicDto,
} from './dto/chapter.dto';

@Injectable()
export class ChaptersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subjectsService: SubjectsService,
  ) {}

  // ---------------------------------------------------------------- chapters

  async createChapter(userId: string, dto: CreateChapterDto) {
    await this.subjectsService.getSubjectById(userId, dto.subjectId);

    const lowest = await this.prisma.chapter.aggregate({
      where: { subjectId: dto.subjectId },
      _min: { orderIndex: true },
    });

    const chapter = await this.prisma.chapter.create({
      data: {
        subjectId: dto.subjectId,
        title: dto.title.trim(),
        // Temporary negative index avoids the [subjectId, orderIndex] unique
        // constraint while the real position is applied below.
        orderIndex: (lowest._min.orderIndex ?? 1) - 1,
        description: dto.description,
        estimatedMinutes: dto.estimatedMinutes || 60,
      },
    });

    await this.applyChapterOrder(dto.subjectId, chapter.id, dto.orderIndex);
    await this.subjectsService.recalculateSubjectProgress(userId, dto.subjectId);

    return this.prisma.chapter.findUnique({ where: { id: chapter.id } });
  }

  async updateChapter(userId: string, chapterId: string, dto: UpdateChapterDto) {
    const chapter = await this.getOwnedChapter(userId, chapterId);

    const data: Prisma.ChapterUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.estimatedMinutes !== undefined) data.estimatedMinutes = dto.estimatedMinutes;
    if (dto.isCompleted !== undefined) {
      data.isCompleted = dto.isCompleted;
      data.completedAt = dto.isCompleted ? new Date() : null;
    }

    if (Object.keys(data).length > 0) {
      await this.prisma.chapter.update({ where: { id: chapterId }, data });
    }
    if (dto.orderIndex !== undefined) {
      await this.applyChapterOrder(chapter.subjectId, chapterId, dto.orderIndex);
    }

    await this.subjectsService.recalculateSubjectProgress(userId, chapter.subjectId);
    return this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { topics: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async completeChapter(userId: string, chapterId: string, completed = true) {
    const chapter = await this.getOwnedChapter(userId, chapterId);

    const updated = await this.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        isCompleted: completed,
        completedAt: completed ? new Date() : null,
      },
    });
    await this.subjectsService.recalculateSubjectProgress(userId, chapter.subjectId);
    return updated;
  }

  async deleteChapter(userId: string, chapterId: string) {
    const chapter = await this.getOwnedChapter(userId, chapterId);

    await this.prisma.chapter.delete({ where: { id: chapterId } });
    await this.subjectsService.recalculateSubjectProgress(userId, chapter.subjectId);
    return { deleted: true, id: chapterId, subjectId: chapter.subjectId };
  }

  // ------------------------------------------------------------------ topics

  async createTopic(userId: string, dto: CreateTopicDto) {
    const chapter = await this.getOwnedChapter(userId, dto.chapterId);

    const lowest = await this.prisma.topic.aggregate({
      where: { chapterId: dto.chapterId },
      _min: { orderIndex: true },
    });

    const topic = await this.prisma.topic.create({
      data: {
        chapterId: dto.chapterId,
        title: dto.title.trim(),
        orderIndex: (lowest._min.orderIndex ?? 1) - 1,
        difficultyLevel: dto.difficultyLevel || 3,
        contentSummary: dto.contentSummary,
        estimatedMinutes: dto.estimatedMinutes || 30,
      },
    });

    await this.applyTopicOrder(dto.chapterId, topic.id, dto.orderIndex);
    await this.subjectsService.recalculateSubjectProgress(userId, chapter.subjectId);

    return this.prisma.topic.findUnique({ where: { id: topic.id } });
  }

  async updateTopic(userId: string, topicId: string, dto: UpdateTopicDto) {
    const topic = await this.getOwnedTopic(userId, topicId);

    const data: Prisma.TopicUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.contentSummary !== undefined) data.contentSummary = dto.contentSummary;
    if (dto.difficultyLevel !== undefined) data.difficultyLevel = dto.difficultyLevel;
    if (dto.estimatedMinutes !== undefined) data.estimatedMinutes = dto.estimatedMinutes;

    if (Object.keys(data).length > 0) {
      await this.prisma.topic.update({ where: { id: topicId }, data });
    }
    if (dto.orderIndex !== undefined) {
      await this.applyTopicOrder(topic.chapterId, topicId, dto.orderIndex);
    }

    return this.prisma.topic.findUnique({ where: { id: topicId } });
  }

  async deleteTopic(userId: string, topicId: string) {
    const topic = await this.getOwnedTopic(userId, topicId);

    await this.prisma.topic.delete({ where: { id: topicId } });
    await this.subjectsService.recalculateSubjectProgress(userId, topic.chapter.subjectId);
    return {
      deleted: true,
      id: topicId,
      chapterId: topic.chapterId,
      subjectId: topic.chapter.subjectId,
    };
  }

  async completeTopic(userId: string, topicId: string, completed = true) {
    const topic = await this.getOwnedTopic(userId, topicId);

    const progress = await this.prisma.studentTopicProgress.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: {
        isCompleted: completed,
        completionPercentage: completed ? 100 : 0,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId,
        topicId,
        isCompleted: completed,
        completionPercentage: completed ? 100 : 0,
        completedAt: completed ? new Date() : null,
      },
    });

    const subjectProgress = await this.subjectsService.recalculateSubjectProgress(
      userId,
      topic.chapter.subjectId,
    );

    return { progress, subjectProgress };
  }

  // ---------------------------------------------------------------- helpers

  private async getOwnedChapter(userId: string, chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true },
    });
    if (!chapter) {
      throw new NotFoundException({ message: 'Chapter not found', code: 'CHAPTER_NOT_FOUND' });
    }
    if (chapter.subject.userId !== userId) {
      throw new ForbiddenException({
        message: 'Access denied: you do not own this chapter',
        code: 'CHAPTER_OWNERSHIP_VIOLATION',
      });
    }
    return chapter;
  }

  private async getOwnedTopic(userId: string, topicId: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: { chapter: { include: { subject: true } } },
    });
    if (!topic) {
      throw new NotFoundException({ message: 'Topic not found', code: 'TOPIC_NOT_FOUND' });
    }
    if (topic.chapter.subject.userId !== userId) {
      throw new ForbiddenException({
        message: 'Access denied: you do not own this topic',
        code: 'TOPIC_OWNERSHIP_VIOLATION',
      });
    }
    return topic;
  }

  /**
   * Moves a chapter to `targetPosition` (1-based) and renumbers its siblings.
   * Two passes (negative, then positive) avoid the [subjectId, orderIndex]
   * unique constraint mid-update.
   */
  private async applyChapterOrder(subjectId: string, chapterId: string, targetPosition: number) {
    const siblings = await this.prisma.chapter.findMany({
      where: { subjectId },
      orderBy: { orderIndex: 'asc' },
      select: { id: true },
    });
    const ids = siblings.map((s) => s.id).filter((id) => id !== chapterId);
    if (!siblings.some((s) => s.id === chapterId)) return;

    const index = Math.min(Math.max(targetPosition, 1), ids.length + 1);
    ids.splice(index - 1, 0, chapterId);

    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < ids.length; i++) {
        await tx.chapter.update({
          where: { id: ids[i] },
          data: { orderIndex: -(i + 1) },
        });
      }
      for (let i = 0; i < ids.length; i++) {
        await tx.chapter.update({
          where: { id: ids[i] },
          data: { orderIndex: i + 1 },
        });
      }
    });
  }

  /** Same as applyChapterOrder, scoped to one chapter's topic list. */
  private async applyTopicOrder(chapterId: string, topicId: string, targetPosition: number) {
    const siblings = await this.prisma.topic.findMany({
      where: { chapterId },
      orderBy: { orderIndex: 'asc' },
      select: { id: true },
    });
    const ids = siblings.map((s) => s.id).filter((id) => id !== topicId);
    if (!siblings.some((s) => s.id === topicId)) return;

    const index = Math.min(Math.max(targetPosition, 1), ids.length + 1);
    ids.splice(index - 1, 0, topicId);

    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < ids.length; i++) {
        await tx.topic.update({
          where: { id: ids[i] },
          data: { orderIndex: -(i + 1) },
        });
      }
      for (let i = 0; i < ids.length; i++) {
        await tx.topic.update({
          where: { id: ids[i] },
          data: { orderIndex: i + 1 },
        });
      }
    });
  }
}
