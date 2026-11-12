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
var StudyPilotJobsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudyPilotJobsProcessor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const leaderboard_service_1 = require("../../modules/leaderboard/leaderboard.service");
let StudyPilotJobsProcessor = StudyPilotJobsProcessor_1 = class StudyPilotJobsProcessor {
    prisma;
    leaderboardService;
    logger = new common_1.Logger(StudyPilotJobsProcessor_1.name);
    constructor(prisma, leaderboardService) {
        this.prisma = prisma;
        this.leaderboardService = leaderboardService;
    }
    async processAssignmentReminders() {
        const dueReminders = await this.prisma.assignmentReminder.findMany({
            where: { isSent: false, remindAt: { lte: new Date() } },
            include: { assignment: true },
            take: 100,
        });
        for (const rem of dueReminders) {
            await this.prisma.$transaction([
                this.prisma.notification.create({
                    data: {
                        userId: rem.assignment.userId,
                        category: 'ASSIGNMENT_REMINDER',
                        title: `Upcoming Deadline: ${rem.assignment.title}`,
                        body: `Your assignment "${rem.assignment.title}" is due at ${rem.assignment.deadline.toISOString()}.`,
                    },
                }),
                this.prisma.assignmentReminder.update({
                    where: { id: rem.id },
                    data: { isSent: true, sentAt: new Date() },
                }),
            ]);
        }
        return { processedCount: dueReminders.length };
    }
    async processSubscriptionExpiries() {
        const expired = await this.prisma.subscription.updateMany({
            where: {
                status: 'ACTIVE',
                currentPeriodEnd: { lte: new Date() },
            },
            data: { status: 'EXPIRED' },
        });
        return { expiredCount: expired.count };
    }
    async snapshotLeaderboard(period) {
        const board = await this.leaderboardService.getLeaderboard(period, 100);
        const periodStart = new Date(board.periodStart);
        const periodEnd = new Date(board.periodEnd);
        for (const entry of board.rankings) {
            await this.prisma.leaderboardSnapshot.upsert({
                where: {
                    period_periodStart_userId: {
                        period,
                        periodStart,
                        userId: entry.userId,
                    },
                },
                update: {
                    points: entry.points,
                    rank: entry.rank,
                    computedAt: new Date(),
                },
                create: {
                    period,
                    periodStart,
                    periodEnd,
                    userId: entry.userId,
                    points: entry.points,
                    rank: entry.rank,
                },
            });
        }
        this.logger.log(`Persisted ${board.rankings.length} ${period} leaderboard snapshots`);
        return { period, count: board.rankings.length };
    }
};
exports.StudyPilotJobsProcessor = StudyPilotJobsProcessor;
exports.StudyPilotJobsProcessor = StudyPilotJobsProcessor = StudyPilotJobsProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        leaderboard_service_1.LeaderboardService])
], StudyPilotJobsProcessor);
//# sourceMappingURL=studypilot-jobs.processor.js.map