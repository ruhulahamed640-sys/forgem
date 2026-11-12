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
exports.RevisionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const rewards_service_1 = require("../rewards/rewards.service");
let RevisionsService = class RevisionsService {
    prisma;
    rewardsService;
    constructor(prisma, rewardsService) {
        this.prisma = prisma;
        this.rewardsService = rewardsService;
    }
    computeNextSchedule(params) {
        const now = params.now ? new Date(params.now) : new Date();
        const quality = 6 - Math.min(5, Math.max(1, params.difficultyRating));
        let ef = Number(params.easinessFactor) || 2.5;
        let rep = params.repetitionNumber;
        let interval = params.previousIntervalDays;
        switch (params.algorithm) {
            case 'LEITNER': {
                const leitnerBoxes = [1, 2, 4, 7, 14, 30, 60];
                if (quality < 3) {
                    rep = 0;
                    interval = leitnerBoxes[0];
                }
                else {
                    rep = Math.min(leitnerBoxes.length - 1, rep + 1);
                    interval = leitnerBoxes[rep];
                }
                break;
            }
            case 'FSRS_LIGHT': {
                if (quality < 3) {
                    rep = 0;
                    interval = 1;
                    ef = Math.max(1.3, ef - 0.25);
                }
                else {
                    rep += 1;
                    const stabilityMultiplier = 1.8 + (quality - 3) * 0.45;
                    interval = rep === 1 ? 2 : Math.max(2, Math.round(interval * stabilityMultiplier));
                    ef = Math.min(3.2, ef + (quality - 3) * 0.1);
                }
                break;
            }
            case 'CUSTOM_INTERVALS': {
                const custom = Array.isArray(params.customIntervals) && params.customIntervals.length > 0
                    ? params.customIntervals
                    : [1, 3, 7, 14, 30];
                if (quality < 3) {
                    rep = 0;
                    interval = custom[0];
                }
                else {
                    const idx = Math.min(custom.length - 1, rep);
                    interval = custom[idx];
                    rep += 1;
                }
                break;
            }
            case 'SM2':
            default: {
                if (quality < 3) {
                    rep = 0;
                    interval = 1;
                }
                else {
                    if (rep === 0) {
                        interval = 1;
                    }
                    else if (rep === 1) {
                        interval = 6;
                    }
                    else {
                        interval = Math.round(interval * ef);
                    }
                    rep += 1;
                }
                ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
                if (ef < 1.3)
                    ef = 1.3;
                break;
            }
        }
        const nextDate = new Date(now.getTime() + interval * 86400 * 1000);
        return {
            nextIntervalDays: interval,
            newEasinessFactor: Math.round(ef * 100) / 100,
            newRepetitionNumber: rep,
            nextRevisionDate: nextDate,
        };
    }
    async listRevisions(userId) {
        return this.prisma.revisionSchedule.findMany({
            where: { userId },
            include: {
                revisionTopic: { include: { topic: { include: { chapter: true } } } },
                history: { orderBy: { recordedAt: 'desc' }, take: 5 },
            },
            orderBy: { scheduledFor: 'asc' },
        });
    }
    async listUpcomingRevisions(userId) {
        return this.prisma.revisionSchedule.findMany({
            where: {
                userId,
                status: 'PENDING',
            },
            include: {
                revisionTopic: { include: { topic: true } },
            },
            orderBy: { scheduledFor: 'asc' },
        });
    }
    async createRevision(userId, dto) {
        const userSettings = await this.prisma.userSetting.findUnique({ where: { userId } });
        const algorithm = dto.algorithm || userSettings?.spacedRepetitionAlgorithm || client_1.SpacedRepetitionAlgorithm.SM2;
        const revTopic = await this.prisma.revisionTopic.upsert({
            where: { userId_topicId: { userId, topicId: dto.topicId } },
            update: {},
            create: {
                userId,
                topicId: dto.topicId,
                masteryLevel: 1,
            },
        });
        return this.prisma.revisionSchedule.create({
            data: {
                userId,
                revisionTopicId: revTopic.id,
                algorithm,
                scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : new Date(),
            },
            include: { revisionTopic: { include: { topic: true } } },
        });
    }
    async completeRevision(userId, scheduleId, dto) {
        const schedule = await this.prisma.revisionSchedule.findUnique({
            where: { id: scheduleId },
            include: { revisionTopic: true },
        });
        if (!schedule) {
            throw new common_1.NotFoundException({
                message: 'Revision schedule not found',
                code: 'REVISION_NOT_FOUND',
            });
        }
        if (schedule.userId !== userId) {
            throw new common_1.ForbiddenException({
                message: 'Access denied: you do not own this revision schedule',
                code: 'REVISION_OWNERSHIP_VIOLATION',
            });
        }
        const userSettings = await this.prisma.userSetting.findUnique({ where: { userId } });
        const customIntervals = Array.isArray(userSettings?.customRevisionIntervals)
            ? userSettings?.customRevisionIntervals
            : undefined;
        const srResult = this.computeNextSchedule({
            algorithm: schedule.algorithm,
            repetitionNumber: schedule.repetitionNumber,
            easinessFactor: Number(schedule.easinessFactor),
            previousIntervalDays: schedule.intervalDays,
            difficultyRating: dto.difficultyRating,
            customIntervals,
        });
        const updated = await this.prisma.$transaction(async (tx) => {
            const updatedSchedule = await tx.revisionSchedule.update({
                where: { id: scheduleId },
                data: {
                    repetitionNumber: srResult.newRepetitionNumber,
                    easinessFactor: srResult.newEasinessFactor,
                    intervalDays: srResult.nextIntervalDays,
                    scheduledFor: srResult.nextRevisionDate,
                    nextRevisionDate: srResult.nextRevisionDate,
                    completedAt: new Date(),
                    status: 'PENDING',
                },
            });
            await tx.revisionSession.create({
                data: {
                    revisionScheduleId: scheduleId,
                    userId,
                    durationMinutes: dto.durationMinutes,
                    difficultyRating: dto.difficultyRating,
                    recallScore: 6 - dto.difficultyRating,
                    notes: dto.notes,
                },
            });
            await tx.revisionHistory.create({
                data: {
                    revisionScheduleId: scheduleId,
                    previousInterval: schedule.intervalDays,
                    newInterval: srResult.nextIntervalDays,
                    previousEasiness: schedule.easinessFactor,
                    newEasiness: srResult.newEasinessFactor,
                    difficultyRating: dto.difficultyRating,
                    nextRevisionDate: srResult.nextRevisionDate,
                },
            });
            await tx.revisionTopic.update({
                where: { id: schedule.revisionTopicId },
                data: {
                    totalReviews: { increment: 1 },
                    lastReviewedAt: new Date(),
                    masteryLevel: Math.min(5, Math.max(1, srResult.newRepetitionNumber)),
                },
            });
            return updatedSchedule;
        });
        const rewardOutcome = await this.rewardsService.processTrustedActivityEvent({
            userId,
            eventCode: 'REVISION_COMPLETED',
            sourceEntityId: `${scheduleId}:rep:${srResult.newRepetitionNumber}`,
            description: `Completed spaced-repetition revision (${schedule.algorithm})`,
        });
        return {
            schedule: updated,
            spacedRepetition: srResult,
            rewardOutcome,
        };
    }
};
exports.RevisionsService = RevisionsService;
exports.RevisionsService = RevisionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rewards_service_1.RewardsService])
], RevisionsService);
//# sourceMappingURL=revisions.service.js.map