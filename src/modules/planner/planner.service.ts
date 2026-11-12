import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RewardsService } from '../rewards/rewards.service';
import { CreateStudyPlanDto } from './dto/planner.dto';

@Injectable()
export class PlannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rewardsService: RewardsService,
  ) {}

  async listPlans(userId: string) {
    // Automatically flag missed tasks whose scheduledDate is before today
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    await this.prisma.studyPlanTask.updateMany({
      where: {
        studyPlan: { userId },
        status: 'PENDING',
        scheduledDate: { lt: startOfToday },
      },
      data: { status: 'MISSED' },
    });

    return this.prisma.studyPlan.findMany({
      where: { userId },
      include: {
        tasks: {
          include: { subject: true },
          orderBy: { scheduledDate: 'asc' },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async createPlan(userId: string, dto: CreateStudyPlanDto, isAiGenerated = false) {
    return this.prisma.studyPlan.create({
      data: {
        userId,
        title: dto.title.trim(),
        description: dto.description,
        periodType: dto.periodType || 'WEEKLY',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        targetMinutes: dto.targetMinutes,
        isAiGenerated,
        tasks:
          dto.tasks && dto.tasks.length > 0
            ? {
                create: dto.tasks.map((t) => ({
                  subjectId: t.subjectId,
                  title: t.title.trim(),
                  description: t.description,
                  scheduledDate: new Date(t.scheduledDate),
                  durationMinutes: t.durationMinutes,
                  priority: t.priority || 'MEDIUM',
                })),
              }
            : undefined,
      },
      include: { tasks: true },
    });
  }

  async getPlanOrVerifyOwnership(userId: string, planId: string) {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id: planId },
      include: { tasks: true },
    });
    if (!plan) {
      throw new NotFoundException({ message: 'Study plan not found', code: 'PLAN_NOT_FOUND' });
    }
    if (plan.userId !== userId) {
      throw new ForbiddenException({
        message: 'Access denied: you do not own this study plan',
        code: 'PLAN_OWNERSHIP_VIOLATION',
      });
    }
    return plan;
  }

  async updatePlan(userId: string, planId: string, dto: Partial<CreateStudyPlanDto>) {
    await this.getPlanOrVerifyOwnership(userId, planId);
    return this.prisma.studyPlan.update({
      where: { id: planId },
      data: {
        title: dto.title,
        description: dto.description,
        targetMinutes: dto.targetMinutes,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: { tasks: true },
    });
  }

  async deletePlan(userId: string, planId: string) {
    await this.getPlanOrVerifyOwnership(userId, planId);
    await this.prisma.studyPlan.delete({ where: { id: planId } });
    return { deleted: true, id: planId };
  }

  async completePlanTask(userId: string, taskOrPlanId: string) {
    // Support completing either a specific task ID or all pending tasks in a plan ID
    const task = await this.prisma.studyPlanTask.findUnique({
      where: { id: taskOrPlanId },
      include: { studyPlan: true },
    });

    if (task) {
      if (task.studyPlan.userId !== userId) {
        throw new ForbiddenException({
          message: 'Access denied: you do not own this study task',
          code: 'PLAN_OWNERSHIP_VIOLATION',
        });
      }
      if (task.status === 'COMPLETED') {
        throw new BadRequestException({
          message: 'Study plan task is already completed',
          code: 'TASK_ALREADY_COMPLETED',
        });
      }

      const updatedPlan = await this.prisma.$transaction(async (tx) => {
        await tx.studyPlanTask.update({
          where: { id: task.id },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });

        const allTasks = await tx.studyPlanTask.findMany({
          where: { studyPlanId: task.studyPlanId },
        });
        const completedMinutes = allTasks
          .filter((t) => t.status === 'COMPLETED' || t.id === task.id)
          .reduce((acc, t) => acc + t.durationMinutes, 0);
        const totalMinutes = Math.max(
          task.studyPlan.targetMinutes,
          allTasks.reduce((acc, t) => acc + t.durationMinutes, 0),
        );
        const pct = Math.min(100, Math.round((completedMinutes / totalMinutes) * 10000) / 100);

        return tx.studyPlan.update({
          where: { id: task.studyPlanId },
          data: { completedMinutes, completionPercentage: pct },
          include: { tasks: true },
        });
      });

      return { completedTaskId: task.id, plan: updatedPlan };
    }

    // Fallback: complete study plan directly
    const plan = await this.getPlanOrVerifyOwnership(userId, taskOrPlanId);
    const updated = await this.prisma.studyPlan.update({
      where: { id: plan.id },
      data: {
        completedMinutes: plan.targetMinutes,
        completionPercentage: 100,
      },
      include: { tasks: true },
    });

    await this.rewardsService.processTrustedActivityEvent({
      userId,
      eventCode: 'STUDY_GOAL_ACHIEVED',
      sourceEntityId: plan.id,
      description: `Completed study plan: ${plan.title}`,
    });

    return { plan: updated };
  }
}
