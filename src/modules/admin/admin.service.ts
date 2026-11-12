import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { UpdateSystemSettingDto, UpdateUserStatusDto } from './dto/admin.dto';
import { CreateRewardCatalogDto, UpdateRewardCatalogDto } from '../rewards/dto/reward.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  async getDashboardMetrics() {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalAssignments,
      totalStudySessions,
      activeSubscriptions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.assignment.count(),
      this.prisma.studySession.count({ where: { status: 'COMPLETED' } }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalAssignments,
      totalStudySessions,
      activeSubscriptions,
    };
  }

  async listUsers(page = 1, limit = 25) {
    const skip = (Math.max(1, page) - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        include: {
          profile: true,
          userRoles: { include: { role: true } },
          userPoints: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);
    return {
      data: users,
      meta: { page, limit, total },
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        settings: true,
        userRoles: { include: { role: true } },
        userPoints: true,
        subscriptions: { include: { plan: true } },
      },
    });
    if (!user) {
      throw new NotFoundException({ message: 'User not found', code: 'USER_NOT_FOUND' });
    }
    return user;
  }

  async updateUserStatus(
    adminUserId: string,
    targetUserId: string,
    dto: UpdateUserStatusDto,
  ) {
    const target = await this.getUserById(targetUserId);

    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: targetUserId },
        data: {
          status: dto.status,
          suspendedAt: dto.status === 'SUSPENDED' ? new Date() : null,
          suspensionReason: dto.status === 'SUSPENDED' ? dto.reason : null,
        },
      });

      if (dto.status === 'SUSPENDED' || dto.status === 'DELETED') {
        await tx.userSession.updateMany({
          where: { userId: targetUserId },
          data: { isRevoked: true, revokedAt: new Date() },
        });
        await tx.refreshToken.updateMany({
          where: { userId: targetUserId },
          data: { isRevoked: true, revokedAt: new Date() },
        });
      }

      await tx.adminAction.create({
        data: {
          adminUserId,
          actionType: 'USER_STATUS_CHANGE',
          targetType: 'USER',
          targetId: targetUserId,
          reason: dto.reason,
          metadata: { previousStatus: target.status, newStatus: dto.status },
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: adminUserId,
          actorRole: 'ADMIN',
          action: 'ADMIN_UPDATE_USER_STATUS',
          entityType: 'USER',
          entityId: targetUserId,
          beforeState: { status: target.status },
          afterState: { status: dto.status, reason: dto.reason },
        },
      });

      return updatedUser;
    });
  }

  async getPlatformAnalytics() {
    const [aiUsage, pointStats, studyStats] = await Promise.all([
      this.prisma.aiUsageLog.aggregate({
        _sum: { totalTokens: true },
        _count: { id: true },
      }),
      this.prisma.pointTransaction.aggregate({
        where: { transactionType: 'EARNED' },
        _sum: { pointsDelta: true },
      }),
      this.prisma.studyStatistic.aggregate({
        _sum: { totalStudySeconds: true, sessionsCompleted: true },
      }),
    ]);

    return {
      aiRequestsCount: aiUsage._count.id || 0,
      totalAiTokensConsumed: aiUsage._sum.totalTokens || 0,
      totalPointsIssued: pointStats._sum.pointsDelta || 0,
      totalPlatformStudyMinutes: Math.floor(
        (studyStats._sum.totalStudySeconds || 0) / 60,
      ),
      totalCompletedStudySessions: studyStats._sum.sessionsCompleted || 0,
    };
  }

  async getAdminLeaderboard() {
    return this.leaderboardService.getLeaderboard('ALL_TIME', 100);
  }

  async listRewardsAndRules() {
    const [catalog, rules] = await Promise.all([
      this.prisma.rewardCatalog.findMany({ orderBy: { createdAt: 'desc' } }),
      this.prisma.rewardRule.findMany({ orderBy: { eventCode: 'asc' } }),
    ]);
    return { catalog, rules };
  }

  async createReward(adminUserId: string, dto: CreateRewardCatalogDto) {
    return this.prisma.$transaction(async (tx) => {
      const reward = await tx.rewardCatalog.create({
        data: {
          name: dto.name.trim(),
          description: dto.description,
          pointsCost: dto.pointsCost,
          stockQuantity: dto.stockQuantity,
          category: dto.category || 'DIGITAL_PERK',
        },
      });

      await tx.adminAction.create({
        data: {
          adminUserId,
          actionType: 'REWARD_CREATE',
          targetType: 'REWARD_CATALOG',
          targetId: reward.id,
          metadata: dto as any,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: adminUserId,
          actorRole: 'ADMIN',
          action: 'ADMIN_CREATE_REWARD',
          entityType: 'REWARD_CATALOG',
          entityId: reward.id,
          afterState: reward as any,
        },
      });

      return reward;
    });
  }

  async updateReward(
    adminUserId: string,
    rewardId: string,
    dto: UpdateRewardCatalogDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.rewardCatalog.update({
        where: { id: rewardId },
        data: dto,
      });

      await tx.auditLog.create({
        data: {
          actorUserId: adminUserId,
          actorRole: 'ADMIN',
          action: 'ADMIN_UPDATE_REWARD',
          entityType: 'REWARD_CATALOG',
          entityId: rewardId,
          afterState: updated as any,
        },
      });

      return updated;
    });
  }

  async listAuditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async listSettings() {
    const [settings, featureFlags] = await Promise.all([
      this.prisma.systemSetting.findMany({ orderBy: { key: 'asc' } }),
      this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } }),
    ]);
    return { settings, featureFlags };
  }

  async updateSetting(adminUserId: string, dto: UpdateSystemSettingDto) {
    return this.prisma.$transaction(async (tx) => {
      const setting = await tx.systemSetting.upsert({
        where: { key: dto.key },
        update: {
          value: dto.value as any,
          description: dto.description,
          updatedBy: adminUserId,
        },
        create: {
          key: dto.key,
          value: dto.value as any,
          description: dto.description,
          updatedBy: adminUserId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: adminUserId,
          actorRole: 'ADMIN',
          action: 'ADMIN_UPDATE_SYSTEM_SETTING',
          entityType: 'SYSTEM_SETTING',
          entityId: setting.id,
          afterState: setting as any,
        },
      });

      return setting;
    });
  }
}
