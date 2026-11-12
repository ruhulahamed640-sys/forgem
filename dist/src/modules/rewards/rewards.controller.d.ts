import { RewardsService } from './rewards.service';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { RedeemRewardDto } from './dto/reward.dto';
export declare class RewardsController {
    private readonly rewardsService;
    constructor(rewardsService: RewardsService);
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
    listAchievements(user: AuthenticatedUser): Promise<({
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
    getHistory(user: AuthenticatedUser): Promise<{
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
    redeem(user: AuthenticatedUser, rewardId: string, dto: RedeemRewardDto): Promise<{
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
