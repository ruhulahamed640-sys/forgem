import { SpacedRepetitionAlgorithm } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RewardsService } from '../rewards/rewards.service';
import { CompleteRevisionDto, CreateRevisionDto } from './dto/revision.dto';
export interface SpacedRepetitionResult {
    nextIntervalDays: number;
    newEasinessFactor: number;
    newRepetitionNumber: number;
    nextRevisionDate: Date;
}
export declare class RevisionsService {
    private readonly prisma;
    private readonly rewardsService;
    constructor(prisma: PrismaService, rewardsService: RewardsService);
    computeNextSchedule(params: {
        algorithm: SpacedRepetitionAlgorithm;
        repetitionNumber: number;
        easinessFactor: number;
        previousIntervalDays: number;
        difficultyRating: number;
        customIntervals?: number[];
        now?: Date;
    }): SpacedRepetitionResult;
    listRevisions(userId: string): Promise<({
        revisionTopic: {
            topic: {
                chapter: {
                    id: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    title: string;
                    subjectId: string;
                    orderIndex: number;
                    estimatedMinutes: number;
                    isCompleted: boolean;
                    completedAt: Date | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                orderIndex: number;
                estimatedMinutes: number;
                chapterId: string;
                contentSummary: string | null;
                difficultyLevel: number;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            topicId: string;
            masteryLevel: number;
            lastReviewedAt: Date | null;
            totalReviews: number;
        };
        history: {
            id: string;
            difficultyRating: number;
            nextRevisionDate: Date;
            recordedAt: Date;
            revisionScheduleId: string;
            previousInterval: number;
            newInterval: number;
            previousEasiness: import("@prisma/client/runtime/library").Decimal;
            newEasiness: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        userId: string;
        completedAt: Date | null;
        algorithm: import(".prisma/client").$Enums.SpacedRepetitionAlgorithm;
        scheduledFor: Date;
        revisionTopicId: string;
        repetitionNumber: number;
        easinessFactor: import("@prisma/client/runtime/library").Decimal;
        intervalDays: number;
        nextRevisionDate: Date | null;
    })[]>;
    listUpcomingRevisions(userId: string): Promise<({
        revisionTopic: {
            topic: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                orderIndex: number;
                estimatedMinutes: number;
                chapterId: string;
                contentSummary: string | null;
                difficultyLevel: number;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            topicId: string;
            masteryLevel: number;
            lastReviewedAt: Date | null;
            totalReviews: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        userId: string;
        completedAt: Date | null;
        algorithm: import(".prisma/client").$Enums.SpacedRepetitionAlgorithm;
        scheduledFor: Date;
        revisionTopicId: string;
        repetitionNumber: number;
        easinessFactor: import("@prisma/client/runtime/library").Decimal;
        intervalDays: number;
        nextRevisionDate: Date | null;
    })[]>;
    createRevision(userId: string, dto: CreateRevisionDto): Promise<{
        revisionTopic: {
            topic: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                orderIndex: number;
                estimatedMinutes: number;
                chapterId: string;
                contentSummary: string | null;
                difficultyLevel: number;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            topicId: string;
            masteryLevel: number;
            lastReviewedAt: Date | null;
            totalReviews: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        userId: string;
        completedAt: Date | null;
        algorithm: import(".prisma/client").$Enums.SpacedRepetitionAlgorithm;
        scheduledFor: Date;
        revisionTopicId: string;
        repetitionNumber: number;
        easinessFactor: import("@prisma/client/runtime/library").Decimal;
        intervalDays: number;
        nextRevisionDate: Date | null;
    }>;
    completeRevision(userId: string, scheduleId: string, dto: CompleteRevisionDto): Promise<{
        schedule: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TaskStatus;
            userId: string;
            completedAt: Date | null;
            algorithm: import(".prisma/client").$Enums.SpacedRepetitionAlgorithm;
            scheduledFor: Date;
            revisionTopicId: string;
            repetitionNumber: number;
            easinessFactor: import("@prisma/client/runtime/library").Decimal;
            intervalDays: number;
            nextRevisionDate: Date | null;
        };
        spacedRepetition: SpacedRepetitionResult;
        rewardOutcome: {
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
        };
    }>;
}
