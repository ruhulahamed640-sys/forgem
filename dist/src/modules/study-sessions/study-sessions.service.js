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
exports.StudySessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const rewards_service_1 = require("../rewards/rewards.service");
const MAX_CONTINUOUS_SESSION_SECONDS = 8 * 3600;
let StudySessionsService = class StudySessionsService {
    prisma;
    rewardsService;
    constructor(prisma, rewardsService) {
        this.prisma = prisma;
        this.rewardsService = rewardsService;
    }
    async startSession(userId, dto) {
        const existingActive = await this.prisma.studySession.findFirst({
            where: {
                userId,
                status: { in: ['ACTIVE', 'PAUSED'] },
            },
        });
        if (existingActive) {
            throw new common_1.ConflictException({
                message: 'An active or paused study session already exists. Complete or resume it first.',
                code: 'ACTIVE_STUDY_SESSION_EXISTS',
            });
        }
        return this.prisma.studySession.create({
            data: {
                userId,
                subjectId: dto.subjectId,
                topicId: dto.topicId,
                clientId: dto.clientId || 'web-app',
                status: 'ACTIVE',
                startTime: new Date(),
                events: {
                    create: { eventType: 'START' },
                },
            },
            include: { events: true, breaks: true },
        });
    }
    async getVerifiedSession(userId, sessionId) {
        const session = await this.prisma.studySession.findUnique({
            where: { id: sessionId },
            include: { events: true, breaks: true },
        });
        if (!session) {
            throw new common_1.NotFoundException({
                message: 'Study session not found',
                code: 'STUDY_SESSION_NOT_FOUND',
            });
        }
        if (session.userId !== userId) {
            throw new common_1.ForbiddenException({
                message: 'Access denied: you do not own this study session',
                code: 'SESSION_OWNERSHIP_VIOLATION',
            });
        }
        return session;
    }
    async pauseSession(userId, sessionId) {
        const session = await this.getVerifiedSession(userId, sessionId);
        if (session.status !== 'ACTIVE') {
            throw new common_1.BadRequestException({
                message: 'Only an ACTIVE study session can be paused',
                code: 'INVALID_SESSION_STATE',
            });
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.studySessionBreak.create({
                data: {
                    studySessionId: sessionId,
                    breakStart: new Date(),
                },
            });
            await tx.studySessionEvent.create({
                data: { studySessionId: sessionId, eventType: 'PAUSE' },
            });
            return tx.studySession.update({
                where: { id: sessionId },
                data: { status: 'PAUSED' },
                include: { breaks: true, events: true },
            });
        });
    }
    async resumeSession(userId, sessionId) {
        const session = await this.getVerifiedSession(userId, sessionId);
        if (session.status !== 'PAUSED') {
            throw new common_1.BadRequestException({
                message: 'Only a PAUSED study session can be resumed',
                code: 'INVALID_SESSION_STATE',
            });
        }
        const now = new Date();
        const openBreak = session.breaks.find((b) => !b.breakEnd);
        const breakDeltaSeconds = openBreak
            ? Math.max(0, Math.floor((now.getTime() - openBreak.breakStart.getTime()) / 1000))
            : 0;
        return this.prisma.$transaction(async (tx) => {
            if (openBreak) {
                await tx.studySessionBreak.update({
                    where: { id: openBreak.id },
                    data: { breakEnd: now, durationSeconds: breakDeltaSeconds },
                });
            }
            await tx.studySessionEvent.create({
                data: { studySessionId: sessionId, eventType: 'RESUME' },
            });
            return tx.studySession.update({
                where: { id: sessionId },
                data: {
                    status: 'ACTIVE',
                    totalBreakSeconds: { increment: breakDeltaSeconds },
                },
                include: { breaks: true, events: true },
            });
        });
    }
    async completeSession(userId, sessionId, dto) {
        const session = await this.getVerifiedSession(userId, sessionId);
        if (session.status === 'COMPLETED' || session.status === 'ABANDONED') {
            throw new common_1.BadRequestException({
                message: 'Study session has already been finalized',
                code: 'SESSION_ALREADY_COMPLETED',
            });
        }
        const now = new Date();
        let totalBreakSeconds = session.totalBreakSeconds;
        const openBreak = session.breaks.find((b) => !b.breakEnd);
        if (openBreak) {
            totalBreakSeconds += Math.max(0, Math.floor((now.getTime() - openBreak.breakStart.getTime()) / 1000));
        }
        const rawElapsedSeconds = Math.max(0, Math.floor((now.getTime() - session.startTime.getTime()) / 1000));
        const netStudySeconds = Math.min(MAX_CONTINUOUS_SESSION_SECONDS, Math.max(0, rawElapsedSeconds - totalBreakSeconds));
        const statDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const completedSession = await this.prisma.$transaction(async (tx) => {
            if (openBreak) {
                await tx.studySessionBreak.update({
                    where: { id: openBreak.id },
                    data: { breakEnd: now },
                });
            }
            await tx.studySessionEvent.create({
                data: {
                    studySessionId: sessionId,
                    eventType: 'COMPLETE',
                    metadata: { rawElapsedSeconds, totalBreakSeconds, netStudySeconds },
                },
            });
            const updated = await tx.studySession.update({
                where: { id: sessionId },
                data: {
                    status: 'COMPLETED',
                    endTime: now,
                    actualDurationSeconds: netStudySeconds,
                    totalBreakSeconds,
                    completedTasksCount: dto.completedTasksCount || 0,
                    notes: dto.notes,
                },
            });
            await tx.studyStatistic.upsert({
                where: { userId_statDate: { userId, statDate } },
                update: {
                    totalStudySeconds: { increment: netStudySeconds },
                    totalBreakSeconds: { increment: totalBreakSeconds },
                    sessionsCompleted: { increment: 1 },
                    tasksCompleted: { increment: dto.completedTasksCount || 0 },
                },
                create: {
                    userId,
                    statDate,
                    totalStudySeconds: netStudySeconds,
                    totalBreakSeconds,
                    sessionsCompleted: 1,
                    tasksCompleted: dto.completedTasksCount || 0,
                    streakDays: 1,
                },
            });
            if (session.subjectId) {
                await tx.studentSubjectProgress.upsert({
                    where: { userId_subjectId: { userId, subjectId: session.subjectId } },
                    update: {
                        totalStudyMinutes: { increment: Math.floor(netStudySeconds / 60) },
                        lastStudiedAt: now,
                    },
                    create: {
                        userId,
                        subjectId: session.subjectId,
                        totalStudyMinutes: Math.floor(netStudySeconds / 60),
                        lastStudiedAt: now,
                    },
                });
            }
            await tx.auditLog.create({
                data: {
                    actorUserId: userId,
                    action: 'STUDY_SESSION_COMPLETED',
                    entityType: 'STUDY_SESSION',
                    entityId: sessionId,
                    afterState: { netStudySeconds, totalBreakSeconds },
                },
            });
            return updated;
        });
        const rewardOutcome = await this.rewardsService.processTrustedActivityEvent({
            userId,
            eventCode: 'STUDY_SESSION_COMPLETED',
            sourceEntityId: sessionId,
            durationSeconds: netStudySeconds,
            description: `Completed ${Math.floor(netStudySeconds / 60)}m study session`,
        });
        return {
            session: completedSession,
            netStudySeconds,
            rewardOutcome,
        };
    }
    async getSessionHistory(userId) {
        const [sessions, dailyStats] = await Promise.all([
            this.prisma.studySession.findMany({
                where: { userId },
                include: { subject: true, topic: true, breaks: true },
                orderBy: { startTime: 'desc' },
                take: 50,
            }),
            this.prisma.studyStatistic.findMany({
                where: { userId },
                orderBy: { statDate: 'desc' },
                take: 30,
            }),
        ]);
        return { sessions, dailyStats };
    }
};
exports.StudySessionsService = StudySessionsService;
exports.StudySessionsService = StudySessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rewards_service_1.RewardsService])
], StudySessionsService);
//# sourceMappingURL=study-sessions.service.js.map