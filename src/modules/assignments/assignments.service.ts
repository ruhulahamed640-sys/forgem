import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RewardsService } from '../rewards/rewards.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rewardsService: RewardsService,
  ) {}

  async listAssignments(
    userId: string,
    filters?: { status?: string; subjectId?: string; page?: number; limit?: number },
  ) {
    const page = Math.max(1, Number(filters?.page || 1));
    const limit = Math.min(100, Math.max(1, Number(filters?.limit || 20)));
    const skip = (page - 1) * limit;

    // Automatically detect and mark overdue assignments before listing
    await this.prisma.assignment.updateMany({
      where: {
        userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        deadline: { lt: new Date() },
      },
      data: { isOverdue: true, status: 'OVERDUE' },
    });

    const where: any = { userId };
    if (filters?.status) where.status = filters.status;
    if (filters?.subjectId) where.subjectId = filters.subjectId;

    const [items, total] = await Promise.all([
      this.prisma.assignment.findMany({
        where,
        include: { subject: true, attachments: true, reminders: true },
        orderBy: { deadline: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.assignment.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createAssignment(userId: string, dto: CreateAssignmentDto) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
    });
    if (!subject || subject.userId !== userId) {
      throw new ForbiddenException({
        message: 'Subject not found or not owned by user',
        code: 'SUBJECT_OWNERSHIP_VIOLATION',
      });
    }

    const deadlineDate = new Date(dto.deadline);
    const remindAt = new Date(deadlineDate.getTime() - 24 * 3600 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          userId,
          subjectId: dto.subjectId,
          title: dto.title.trim(),
          description: dto.description,
          deadline: deadlineDate,
          priority: dto.priority || 'MEDIUM',
          assignmentSubjects: {
            create: { subjectId: dto.subjectId, isPrimary: true },
          },
          reminders:
            remindAt > new Date()
              ? {
                  create: {
                    remindAt,
                    channel: 'IN_APP',
                  },
                }
              : undefined,
        },
        include: { subject: true, reminders: true },
      });
      return assignment;
    });
  }

  async getAssignmentById(userId: string, assignmentId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        subject: true,
        attachments: true,
        submissions: true,
        comments: true,
        reminders: true,
      },
    });
    if (!assignment) {
      throw new NotFoundException({
        message: 'Assignment not found',
        code: 'ASSIGNMENT_NOT_FOUND',
      });
    }
    if (assignment.userId !== userId) {
      throw new ForbiddenException({
        message: 'Access denied: you do not own this assignment',
        code: 'ASSIGNMENT_OWNERSHIP_VIOLATION',
      });
    }
    return assignment;
  }

  async updateAssignment(userId: string, assignmentId: string, dto: UpdateAssignmentDto) {
    await this.getAssignmentById(userId, assignmentId);
    return this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  async deleteAssignment(userId: string, assignmentId: string) {
    await this.getAssignmentById(userId, assignmentId);
    await this.prisma.assignment.delete({ where: { id: assignmentId } });
    return { deleted: true, id: assignmentId };
  }

  /**
   * Section 7 Business Logic: Complete Assignment (11-step verified workflow)
   * 1. Authenticate user (via Guard)
   * 2. Retrieve assignment
   * 3. Verify ownership
   * 4. Verify current status (prevent double completion)
   * 5. Update completion status & percentage (100%)
   * 6. Record completion & submission timestamps
   * 7. Generate eligible activity event
   * 8. Evaluate point eligibility (on-time vs late)
   * 9. Create immutable point transaction if eligible
   * 10. Check achievement conditions
   * 11. Schedule/record completion notification
   */
  async completeAssignment(userId: string, assignmentId: string, notes?: string) {
    const assignment = await this.getAssignmentById(userId, assignmentId);

    if (assignment.status === 'COMPLETED' || assignment.status === 'GRADED') {
      throw new BadRequestException({
        message: 'Assignment has already been completed',
        code: 'ASSIGNMENT_ALREADY_COMPLETED',
      });
    }

    const now = new Date();
    const completedOnTime = now <= assignment.deadline;

    const updatedAssignment = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'COMPLETED',
          completionPercentage: 100,
          submittedAt: now,
          completedAt: now,
          isOverdue: !completedOnTime,
        },
      });

      await tx.assignmentSubmission.create({
        data: {
          assignmentId,
          userId,
          notes: notes || 'Completed via StudyPilot',
          submittedAt: now,
        },
      });

      await tx.notification.create({
        data: {
          userId,
          category: 'ASSIGNMENT_REMINDER',
          title: `Assignment Completed: ${assignment.title}`,
          body: completedOnTime
            ? `Great work! You completed "${assignment.title}" ahead of the deadline.`
            : `You completed "${assignment.title}" after the deadline.`,
        },
      });

      return updated;
    });

    const rewardOutcome = await this.rewardsService.processTrustedActivityEvent({
      userId,
      eventCode: completedOnTime ? 'ASSIGNMENT_COMPLETED' : 'ASSIGNMENT_COMPLETED_LATE',
      sourceEntityId: assignmentId,
      description: `Completed assignment: ${assignment.title}`,
    });

    return {
      assignment: updatedAssignment,
      completedOnTime,
      rewardOutcome,
    };
  }
}
