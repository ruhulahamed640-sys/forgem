import { PrismaService } from '../../database/prisma/prisma.service';
import { LeaderboardService } from '../../modules/leaderboard/leaderboard.service';
export declare class StudyPilotJobsProcessor {
    private readonly prisma;
    private readonly leaderboardService;
    private readonly logger;
    constructor(prisma: PrismaService, leaderboardService: LeaderboardService);
    processAssignmentReminders(): Promise<{
        processedCount: number;
    }>;
    processSubscriptionExpiries(): Promise<{
        expiredCount: number;
    }>;
    snapshotLeaderboard(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'): Promise<{
        period: "MONTHLY" | "DAILY" | "WEEKLY" | "ALL_TIME";
        count: number;
    }>;
}
