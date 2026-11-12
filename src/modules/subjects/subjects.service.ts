import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async listSubjects(userId: string) {
    return this.prisma.subject.findMany({
      where: { userId, isArchived: false },
      include: {
        chapters: {
          orderBy: { orderIndex: 'asc' },
          include: { topics: { orderBy: { orderIndex: 'asc' } } },
        },
        subjectProgress: { where: { userId } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createSubject(userId: string, dto: CreateSubjectDto) {
    return this.prisma.$transaction(async (tx) => {
      const subject = await tx.subject.create({
        data: {
          userId,
          name: dto.name.trim(),
          code: dto.code,
          colorHex: dto.colorHex || '#4F46E5',
          targetWeeklyMinutes: dto.targetWeeklyMinutes || 180,
        },
      });
      await tx.studentSubjectProgress.create({
        data: {
          userId,
          subjectId: subject.id,
        },
      });
      return subject;
    });
  }

  async getSubjectById(userId: string, subjectId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        chapters: {
          orderBy: { orderIndex: 'asc' },
          include: { topics: { orderBy: { orderIndex: 'asc' } } },
        },
        subjectProgress: { where: { userId } },
      },
    });
    if (!subject) {
      throw new NotFoundException({ message: 'Subject not found', code: 'SUBJECT_NOT_FOUND' });
    }
    if (subject.userId !== userId) {
      throw new ForbiddenException({
        message: 'Access denied: you do not own this subject',
        code: 'SUBJECT_OWNERSHIP_VIOLATION',
      });
    }
    return subject;
  }

  async updateSubject(userId: string, subjectId: string, dto: UpdateSubjectDto) {
    await this.getSubjectById(userId, subjectId);
    return this.prisma.subject.update({
      where: { id: subjectId },
      data: dto,
    });
  }

  async deleteSubject(userId: string, subjectId: string) {
    await this.getSubjectById(userId, subjectId);
    await this.prisma.subject.delete({ where: { id: subjectId } });
    return { deleted: true, id: subjectId };
  }

  async recalculateSubjectProgress(userId: string, subjectId: string) {
    const chapters = await this.prisma.chapter.findMany({
      where: { subjectId },
      include: { topics: true },
    });
    const totalChapters = chapters.length;
    const completedChapters = chapters.filter((c) => c.isCompleted).length;
    const totalTopics = chapters.reduce((acc, c) => acc + c.topics.length, 0);
    const completionPercentage =
      totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 10000) / 100 : 0;

    return this.prisma.studentSubjectProgress.upsert({
      where: { userId_subjectId: { userId, subjectId } },
      update: {
        totalChapters,
        completedChapters,
        totalTopics,
        completionPercentage,
        lastStudiedAt: new Date(),
      },
      create: {
        userId,
        subjectId,
        totalChapters,
        completedChapters,
        totalTopics,
        completionPercentage,
        lastStudiedAt: new Date(),
      },
    });
  }
}
