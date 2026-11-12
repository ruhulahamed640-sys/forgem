import { PrismaService } from '../../database/prisma/prisma.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { UpdateSystemSettingDto, UpdateUserStatusDto } from './dto/admin.dto';
import { CreateRewardCatalogDto, UpdateRewardCatalogDto } from '../rewards/dto/reward.dto';
export declare class AdminService {
    private readonly prisma;
    private readonly leaderboardService;
    constructor(prisma: PrismaService, leaderboardService: LeaderboardService);
    getDashboardMetrics(): Promise<{
        totalUsers: number;
        activeUsers: number;
        suspendedUsers: number;
        totalAssignments: number;
        totalStudySessions: number;
        activeSubscriptions: number;
    }>;
    listUsers(page?: number, limit?: number): Promise<{
        data: ({
            userRoles: ({
                role: {
                    id: string;
                    name: import(".prisma/client").$Enums.RoleName;
                    description: string | null;
                    isSystem: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                createdAt: Date;
                roleId: string;
                userId: string;
                assignedBy: string | null;
            })[];
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                displayName: string | null;
                avatarStorageKey: string | null;
                bio: string | null;
                dateOfBirth: Date | null;
                phone: string | null;
                timezone: string;
                locale: string;
                institutionId: string | null;
                classId: string | null;
                academicYearId: string | null;
                userId: string;
            } | null;
            userPoints: {
                id: string;
                updatedAt: Date;
                totalPointsEarned: number;
                currentBalance: number;
                totalPointsSpent: number;
                currentStreakDays: number;
                longestStreakDays: number;
                userId: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            passwordHash: string;
            status: import(".prisma/client").$Enums.AccountStatus;
            emailVerifiedAt: Date | null;
            lastLoginAt: Date | null;
            suspendedAt: Date | null;
            suspensionReason: string | null;
            deletedAt: Date | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    getUserById(userId: string): Promise<{
        userRoles: ({
            role: {
                id: string;
                name: import(".prisma/client").$Enums.RoleName;
                description: string | null;
                isSystem: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            roleId: string;
            userId: string;
            assignedBy: string | null;
        })[];
        subscriptions: ({
            plan: {
                id: string;
                name: string;
                createdAt: Date;
                code: string;
                priceCents: number;
                currency: string;
                billingInterval: string;
                dailyAiTokenLimit: number;
                storageQuotaBytes: bigint;
                features: import("@prisma/client/runtime/library").JsonValue;
                isActive: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            userId: string;
            externalSubscriptionId: string | null;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            cancelAtPeriodEnd: boolean;
            cancelledAt: Date | null;
            planId: string;
        })[];
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            displayName: string | null;
            avatarStorageKey: string | null;
            bio: string | null;
            dateOfBirth: Date | null;
            phone: string | null;
            timezone: string;
            locale: string;
            institutionId: string | null;
            classId: string | null;
            academicYearId: string | null;
            userId: string;
        } | null;
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            dailyStudyTargetMinutes: number;
            weeklyStudyTargetMinutes: number;
            pomodoroWorkMinutes: number;
            pomodoroBreakMinutes: number;
            spacedRepetitionAlgorithm: import(".prisma/client").$Enums.SpacedRepetitionAlgorithm;
            customRevisionIntervals: import("@prisma/client/runtime/library").JsonValue | null;
            leaderboardOptIn: boolean;
            extensionSyncEnabled: boolean;
            aiAssistanceEnabled: boolean;
            userId: string;
        } | null;
        userPoints: {
            id: string;
            updatedAt: Date;
            totalPointsEarned: number;
            currentBalance: number;
            totalPointsSpent: number;
            currentStreakDays: number;
            longestStreakDays: number;
            userId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        status: import(".prisma/client").$Enums.AccountStatus;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        suspendedAt: Date | null;
        suspensionReason: string | null;
        deletedAt: Date | null;
    }>;
    updateUserStatus(adminUserId: string, targetUserId: string, dto: UpdateUserStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        status: import(".prisma/client").$Enums.AccountStatus;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        suspendedAt: Date | null;
        suspensionReason: string | null;
        deletedAt: Date | null;
    }>;
    getPlatformAnalytics(): Promise<{
        aiRequestsCount: number;
        totalAiTokensConsumed: number;
        totalPointsIssued: number;
        totalPlatformStudyMinutes: number;
        totalCompletedStudySessions: number;
    }>;
    getAdminLeaderboard(): Promise<{
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
    listRewardsAndRules(): Promise<{
        catalog: {
            id: string;
            name: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            pointsCost: number;
            stockQuantity: number;
            category: string;
        }[];
        rules: {
            id: string;
            description: string;
            updatedAt: Date;
            isActive: boolean;
            eventCode: string;
            pointsAwarded: number;
            maxDailyOccurrences: number;
            cooldownSeconds: number;
            minDurationSeconds: number;
        }[];
    }>;
    createReward(adminUserId: string, dto: CreateRewardCatalogDto): Promise<{
        id: string;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        pointsCost: number;
        stockQuantity: number;
        category: string;
    }>;
    updateReward(adminUserId: string, rewardId: string, dto: UpdateRewardCatalogDto): Promise<{
        id: string;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        pointsCost: number;
        stockQuantity: number;
        category: string;
    }>;
    listAuditLogs(): Promise<{
        id: string;
        createdAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        entityType: string;
        entityId: string | null;
        actorRole: string | null;
        action: string;
        beforeState: import("@prisma/client/runtime/library").JsonValue | null;
        afterState: import("@prisma/client/runtime/library").JsonValue | null;
        actorUserId: string | null;
    }[]>;
    listSettings(): Promise<{
        settings: {
            id: string;
            description: string | null;
            updatedAt: Date;
            key: string;
            value: import("@prisma/client/runtime/library").JsonValue;
            updatedBy: string | null;
        }[];
        featureFlags: {
            id: string;
            description: string | null;
            updatedAt: Date;
            key: string;
            isEnabled: boolean;
            rolloutPercentage: number;
        }[];
    }>;
    updateSetting(adminUserId: string, dto: UpdateSystemSettingDto): Promise<{
        id: string;
        description: string | null;
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
        updatedBy: string | null;
    }>;
}
