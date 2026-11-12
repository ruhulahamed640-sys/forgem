import { LeaderboardPeriod } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
export declare class LeaderboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPeriodBoundaries(period: LeaderboardPeriod, referenceDate?: Date): {
        periodStart: Date;
        periodEnd: Date;
    };
    getLeaderboard(period: LeaderboardPeriod, limit?: number): Promise<{
        period: import(".prisma/client").$Enums.LeaderboardPeriod;
        timezone: string;
        periodStart: string;
        periodEnd: string;
        rankings: {
            rank: number;
            userId: string;
            displayName: string;
            points: number;
        }[];
    }>;
    getMyStanding(userId: string): Promise<{
        userId: string;
        balance: number;
        totalPointsEarned: number;
        standings: {
            daily: {
                rank: number;
                points: number;
            } | {
                rank: null;
                points: number;
            };
            weekly: {
                rank: number;
                points: number;
            } | {
                rank: null;
                points: number;
            };
            monthly: {
                rank: number;
                points: number;
            } | {
                rank: null;
                points: number;
            };
            allTime: {
                rank: number;
                points: number;
            } | {
                rank: null;
                points: number;
            };
        };
    }>;
}
