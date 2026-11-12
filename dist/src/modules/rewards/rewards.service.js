"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let RewardsService = class RewardsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processTrustedActivityEvent(event) {
        const idempotencyKey = `${event.userId}:${event.eventCode}:${event.sourceEntityId}`;
        const existingTx = await this.prisma.pointTransaction.findUnique({
            where: { idempotencyKey },
        });
        if (existingTx) {
            return { awarded: false, reason: 'DUPLICATE_EVENT_IDEMPOTENT', transaction: existingTx };
        }
        const rule = await this.prisma.rewardRule.findUnique({
            where: { eventCode: event.eventCode },
        });
        if (!rule || !rule.isActive) {
            return { awarded: false, reason: 'RULE_INACTIVE_OR_MISSING' };
        }
        if (rule.minDurationSeconds > 0 &&
            (event.durationSeconds ?? 0) < rule.minDurationSeconds) {
            return {
                awarded: false,
                reason: `MINIMUM_DURATION_NOT_MET (${event.durationSeconds ?? 0}s < ${rule.minDurationSeconds}s)`,
            };
        }
        const startOfUtcDay = new Date();
        startOfUtcDay.setUTCHours(0, 0, 0, 0);
        const recentToday = await this.prisma.pointTransaction.findMany({
            where: {
                userId: event.userId,
                eventCode: event.eventCode,
                createdAt: { gte: startOfUtcDay },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (recentToday.length >= rule.maxDailyOccurrences) {
            return { awarded: false, reason: 'DAILY_CAP_REACHED' };
        }
        if (recentToday.length > 0 && rule.cooldownSeconds > 0) {
            const lastTxTime = recentToday[0].createdAt.getTime();
            const elapsedSeconds = (Date.now() - lastTxTime) / 1000;
            if (elapsedSeconds < rule.cooldownSeconds) {
                return { awarded: false, reason: 'COOLDOWN_ACTIVE' };
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const userPoint = await tx.userPoint.upsert({
                where: { userId: event.userId },
                update: {
                    totalPointsEarned: { increment: rule.pointsAwarded },
                    currentBalance: { increment: rule.pointsAwarded },
                },
                create: {
                    userId: event.userId,
                    totalPointsEarned: rule.pointsAwarded,
                    currentBalance: rule.pointsAwarded,
                },
            });
            const pointTx = await tx.pointTransaction.create({
                data: {
                    userId: event.userId,
                    transactionType: 'EARNED',
                    eventCode: event.eventCode,
                    sourceEntityId: event.sourceEntityId,
                    idempotencyKey,
                    pointsDelta: rule.pointsAwarded,
                    balanceAfter: userPoint.currentBalance,
                    description: event.description || rule.description,
                },
            });
            await tx.activityLog.create({
                data: {
                    userId: event.userId,
                    activityType: event.eventCode,
                    entityType: 'POINT_TRANSACTION',
                    entityId: pointTx.id,
                    metadata: { pointsAwarded: rule.pointsAwarded, sourceEntityId: event.sourceEntityId },
                },
            });
            const unlockedAchievements = await this.evaluateAchievementsInTx(tx, event.userId);
            return {
                awarded: true,
                pointsAwarded: rule.pointsAwarded,
                balanceAfter: userPoint.currentBalance,
                transaction: pointTx,
                unlockedAchievements,
            };
        });
    }
    async evaluateAchievementsInTx(tx, userId) {
        const activeAchievements = await tx.achievement.findMany({
            where: { isActive: true },
        });
        const existingUnlocks = await tx.userAchievement.findMany({
            where: { userId },
            select: { achievementId: true },
        });
        const unlockedSet = new Set(existingUnlocks.map((u) => u.achievementId));
        const completedAssignments = await tx.assignment.count({
            where: { userId, status: 'COMPLETED' },
        });
        const completedRevisions = await tx.revisionSession.count({
            where: { userId },
        });
        const studyStats = await tx.studyStatistic.aggregate({
            where: { userId },
            _sum: { totalStudySeconds: true },
        });
        const totalStudyMinutes = Math.floor((studyStats._sum.totalStudySeconds || 0) / 60);
        const newlyUnlocked = [];
        for (const ach of activeAchievements) {
            if (unlockedSet.has(ach.id))
                continue;
            let qualifies = false;
            if (ach.criteriaType === 'ASSIGNMENTS_COMPLETED' && completedAssignments >= ach.criteriaValue) {
                qualifies = true;
            }
            else if (ach.criteriaType === 'TOTAL_STUDY_MINUTES' && totalStudyMinutes >= ach.criteriaValue) {
                qualifies = true;
            }
            else if (ach.criteriaType === 'REVISIONS_COMPLETED' && completedRevisions >= ach.criteriaValue) {
                qualifies = true;
            }
            if (qualifies) {
                const ua = await tx.userAchievement.create({
                    data: { userId, achievementId: ach.id },
                    include: { achievement: true },
                });
                newlyUnlocked.push(ua.achievement);
                await tx.notification.create({
                    data: {
                        userId,
                        category: 'ACHIEVEMENT',
                        title: `Achievement Unlocked: ${ach.title}`,
                        body: ach.description,
                    },
                });
            }
        }
        return newlyUnlocked;
    }
    async listCatalog() {
        return this.prisma.rewardCatalog.findMany({
            where: { isActive: true },
            orderBy: { pointsCost: 'asc' },
        });
    }
    async listUserAchievements(userId) {
        return this.prisma.userAchievement.findMany({
            where: { userId },
            include: { achievement: true },
            orderBy: { unlockedAt: 'desc' },
        });
    }
    async getRewardHistory(userId) {
        const [transactions, redemptions] = await Promise.all([
            this.prisma.pointTransaction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 100,
            }),
            this.prisma.rewardRedemption.findMany({
                where: { userId },
                include: { reward: true },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return { transactions, redemptions };
    }
    async redeemReward(userId, rewardId, dto) {
        const idempotencyKey = `${userId}:redeem:${rewardId}:${dto.idempotencyKey}`;
        const existingRedemption = await this.prisma.rewardRedemption.findUnique({
            where: { idempotencyKey },
            include: { reward: true },
        });
        if (existingRedemption) {
            throw new common_1.ConflictException({
                message: 'Duplicate reward redemption request detected',
                code: 'DUPLICATE_REWARD_REDEMPTION',
            });
        }
        return this.prisma.$transaction(async (tx) => {
            const reward = await tx.rewardCatalog.findUnique({ where: { id: rewardId } });
            if (!reward || !reward.isActive) {
                throw new common_1.NotFoundException({
                    message: 'Reward item not found or inactive',
                    code: 'REWARD_NOT_FOUND',
                });
            }
            if (reward.stockQuantity <= 0) {
                throw new common_1.BadRequestException({
                    message: 'Reward is currently out of stock',
                    code: 'REWARD_OUT_OF_STOCK',
                });
            }
            const userPoints = await tx.userPoint.findUnique({ where: { userId } });
            if (!userPoints || userPoints.currentBalance < reward.pointsCost) {
                throw new common_1.BadRequestException({
                    message: 'Insufficient point balance to redeem this reward',
                    code: 'INSUFFICIENT_POINTS',
                });
            }
            const updatedPoints = await tx.userPoint.update({
                where: { userId },
                data: {
                    currentBalance: { decrement: reward.pointsCost },
                    totalPointsSpent: { increment: reward.pointsCost },
                },
            });
            await tx.rewardCatalog.update({
                where: { id: rewardId },
                data: { stockQuantity: { decrement: 1 } },
            });
            const redemption = await tx.rewardRedemption.create({
                data: {
                    userId,
                    rewardId,
                    pointsSpent: reward.pointsCost,
                    idempotencyKey,
                    status: 'APPROVED',
                    fulfilledAt: new Date(),
                },
                include: { reward: true },
            });
            await tx.pointTransaction.create({
                data: {
                    userId,
                    transactionType: 'REDEEMED',
                    eventCode: 'REWARD_REDEEMED',
                    sourceEntityId: redemption.id,
                    idempotencyKey,
                    pointsDelta: -reward.pointsCost,
                    balanceAfter: updatedPoints.currentBalance,
                    description: `Redeemed reward: ${reward.name}`,
                },
            });
            await tx.notification.create({
                data: {
                    userId,
                    category: 'REWARD',
                    title: `Reward Redeemed: ${reward.name}`,
                    body: `You redeemed ${reward.name} for ${reward.pointsCost} points.`,
                },
            });
            return {
                redemption,
                remainingBalance: updatedPoints.currentBalance,
            };
        });
    }
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map