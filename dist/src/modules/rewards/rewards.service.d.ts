import { PrismaService } from '../../database/prisma/prisma.service';
import { RedeemRewardDto } from './dto/reward.dto';
export interface TrustedActivityEvent {
    userId: string;
    eventCode: 'ASSIGNMENT_COMPLETED' | 'ASSIGNMENT_COMPLETED_LATE' | 'STUDY_SESSION_COMPLETED' | 'REVISION_COMPLETED' | 'STUDY_GOAL_ACHIEVED' | 'STREAK_MILESTONE_7D';
    sourceEntityId: string;
    durationSeconds?: number;
    description?: string;
}
export declare class RewardsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    processTrustedActivityEvent(event: TrustedActivityEvent): Promise<{
        awarded: boolean;
        pointsAwarded: number;
        balanceAfter: number;
        transaction: {
            id: string;
            description: string | null;
            createdAt: Date;
            eventCode: string;
            userId: string;
            idempotencyKey: string;
            transactionType: import(".prisma/client").$Enums.PointTransactionType;
            sourceEntityId: string;
            pointsDelta: number;
            balanceAfter: number;
        };
        unlockedAchievements: any[];
    } | {
        awarded: boolean;
        reason: string;
        transaction: {
            id: string;
            description: string | null;
            createdAt: Date;
            eventCode: string;
            userId: string;
            idempotencyKey: string;
            transactionType: import(".prisma/client").$Enums.PointTransactionType;
            sourceEntityId: string;
            pointsDelta: number;
            balanceAfter: number;
        };
    } | {
        awarded: boolean;
        reason: string;
        transaction?: undefined;
    }>;
    private evaluateAchievementsInTx;
    listCatalog(): Promise<{
        id: string;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        pointsCost: number;
        stockQuantity: number;
        category: string;
    }[]>;
    listUserAchievements(userId: string): Promise<({
        achievement: {
            id: string;
            description: string;
            createdAt: Date;
            code: string;
            isActive: boolean;
            title: string;
            icon: string | null;
            criteriaType: string;
            criteriaValue: number;
            bonusPoints: number;
        };
    } & {
        id: string;
        userId: string;
        achievementId: string;
        unlockedAt: Date;
    })[]>;
    getRewardHistory(userId: string): Promise<{
        transactions: {
            id: string;
            description: string | null;
            createdAt: Date;
            eventCode: string;
            userId: string;
            idempotencyKey: string;
            transactionType: import(".prisma/client").$Enums.PointTransactionType;
            sourceEntityId: string;
            pointsDelta: number;
            balanceAfter: number;
        }[];
        redemptions: ({
            reward: {
                id: string;
                name: string;
                description: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                pointsCost: number;
                stockQuantity: number;
                category: string;
            };
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.RedemptionStatus;
            userId: string;
            idempotencyKey: string;
            rewardId: string;
            pointsSpent: number;
            fulfilledAt: Date | null;
        })[];
    }>;
    redeemReward(userId: string, rewardId: string, dto: RedeemRewardDto): Promise<{
        redemption: {
            reward: {
                id: string;
                name: string;
                description: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                pointsCost: number;
                stockQuantity: number;
                category: string;
            };
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.RedemptionStatus;
            userId: string;
            idempotencyKey: string;
            rewardId: string;
            pointsSpent: number;
            fulfilledAt: Date | null;
        };
        remainingBalance: number;
    }>;
}
