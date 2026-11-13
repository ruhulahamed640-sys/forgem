import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';

export interface ListSubjectsOptions {
  archived?: string;
  search?: string;
}

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async listSubjects(userId: string, options: ListSubjectsOptions = {}) {
    const archived = (options.archived || 'false').toLowerCase();
    const where: Prisma.SubjectWhereInput = { userId };

    if (archived === 'true') {
      where.isArchived = true;
    } else if (archived === 'all') {
      // no archive filter
    } else {
      where.isArchived = false;
    }

    const search = options.search?.trim();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.subject.findMany({
      where,
      include: {
        chapters: {
          orderBy: { orderIndex: 'asc' },
          include: {
            topics: {
              orderBy: { orderIndex: 'asc' },
              include: { topicProgress: { where: { userId } } },
            },
          },
        },
        subjectProgress: { where: { userId } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createSubject(userId: string, dto: CreateSubjectDto) {
    const name = dto.name.trim();
    const existing = await this.prisma.subject.findFirst({
      where: { userId, name: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException({
        message: 'A subject with this name already exists',
        code: 'SUBJECT_ALREADY_EXISTS',
      });
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const subject = await tx.subject.create({
          data: {
            userId,
            name,
            code: dto.code,
            colorHex: dto.colorHex || '#4F46E5',
            icon: dto.icon,
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException({
          message: 'A subject with this name already exists',
          code: 'SUBJECT_ALREADY_EXISTS',
        });
      }
      throw error;
    }
  }

  async getSubjectById(userId: string, subjectId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        chapters: {
          orderBy: { orderIndex: 'asc' },
          include: {
            topics: {
              orderBy: { orderIndex: 'asc' },
              include: { topicProgress: { where: { userId } } },
            },
          },
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

    const data: Prisma.SubjectUpdateInput = {};
    if (dto.name !== undefined) {
      const name = dto.name.trim();
      const duplicate = await this.prisma.subject.findFirst({
        where: {
          userId,
          name: { equals: name, mode: 'insensitive' },
          NOT: { id: subjectId },
        },
        select: { id: true },
      });
      if (duplicate) {
        throw new ConflictException({
          message: 'A subject with this name already exists',
          code: 'SUBJECT_ALREADY_EXISTS',
        });
      }
      data.name = name;
    }
    if (dto.code !== undefined) data.code = dto.code;
    if (dto.colorHex !== undefined) data.colorHex = dto.colorHex;
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.targetWeeklyMinutes !== undefined) data.targetWeeklyMinutes = dto.targetWeeklyMinutes;
    if (dto.isArchived !== undefined) data.isArchived = dto.isArchived;

    return this.prisma.subject.update({ where: { id: subjectId }, data });
  }

  async deleteSubject(userId: string, subjectId: string) {
    await this.getSubjectById(userId, subjectId);
    await this.prisma.subject.delete({ where: { id: subjectId } });
    return { deleted: true, id: subjectId };
  }

  async recalculateSubjectProgress(userId: string, subjectId: string) {
    const [chapters, completedTopics] = await Promise.all([
      this.prisma.chapter.findMany({
        where: { subjectId },
        include: { topics: true },
      }),
      this.prisma.studentTopicProgress.count({
        where: {
          userId,
          isCompleted: true,
          topic: { chapter: { subjectId } },
        },
      }),
    ]);
    const totalChapters = chapters.length;
    const completedChapters = chapters.filter((c) => c.isCompleted).length;
    const totalTopics = chapters.reduce((acc, c) => acc + c.topics.length, 0);
    // Progress is chapter-based: percentage is driven by completed chapters only.
    const completionPercentage =
      totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 10000) / 100 : 0;

    return this.prisma.studentSubjectProgress.upsert({
      where: { userId_subjectId: { userId, subjectId } },
      update: {
        totalChapters,
        completedChapters,
        totalTopics,
        completedTopics,
        completionPercentage,
        lastStudiedAt: new Date(),
      },
      create: {
        userId,
        subjectId,
        totalChapters,
        completedChapters,
        totalTopics,
        completedTopics,
        completionPercentage,
        lastStudiedAt: new Date(),
      },
    });
  }
}
