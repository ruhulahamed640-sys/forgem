import { LeaderboardService } from './leaderboard.service';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
export declare class LeaderboardController {
    private readonly leaderboardService;
    constructor(leaderboardService: LeaderboardService);
    getDaily(): Promise<{
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
    getWeekly(): Promise<{
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
    getMonthly(): Promise<{
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
    getAllTime(): Promise<{
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
    getMe(user: AuthenticatedUser): Promise<{
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
