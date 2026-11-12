import { PrismaService } from '../../database/prisma/prisma.service';
import { RewardsService } from '../rewards/rewards.service';
import { CompleteStudySessionDto, StartStudySessionDto } from './dto/study-session.dto';
export declare class StudySessionsService {
    private readonly prisma;
    private readonly rewardsService;
    constructor(prisma: PrismaService, rewardsService: RewardsService);
    startSession(userId: string, dto: StartStudySessionDto): Promise<{
        events: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import(".prisma/client").$Enums.StudySessionEventType;
            serverTime: Date;
            studySessionId: string;
        }[];
        breaks: {
            id: string;
            studySessionId: string;
            breakStart: Date;
            breakEnd: Date | null;
            durationSeconds: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StudySessionStatus;
        notes: string | null;
        userId: string;
        subjectId: string | null;
        clientId: string;
        topicId: string | null;
        completedTasksCount: number;
        startTime: Date;
        endTime: Date | null;
        actualDurationSeconds: number;
        totalBreakSeconds: number;
    }>;
    private getVerifiedSession;
    pauseSession(userId: string, sessionId: string): Promise<{
        events: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import(".prisma/client").$Enums.StudySessionEventType;
            serverTime: Date;
            studySessionId: string;
        }[];
        breaks: {
            id: string;
            studySessionId: string;
            breakStart: Date;
            breakEnd: Date | null;
            durationSeconds: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StudySessionStatus;
        notes: string | null;
        userId: string;
        subjectId: string | null;
        clientId: string;
        topicId: string | null;
        completedTasksCount: number;
        startTime: Date;
        endTime: Date | null;
        actualDurationSeconds: number;
        totalBreakSeconds: number;
    }>;
    resumeSession(userId: string, sessionId: string): Promise<{
        events: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            eventType: import(".prisma/client").$Enums.StudySessionEventType;
            serverTime: Date;
            studySessionId: string;
        }[];
        breaks: {
            id: string;
            studySessionId: string;
            breakStart: Date;
            breakEnd: Date | null;
            durationSeconds: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.StudySessionStatus;
        notes: string | null;
        userId: string;
        subjectId: string | null;
        clientId: string;
        topicId: string | null;
        completedTasksCount: number;
        startTime: Date;
        endTime: Date | null;
        actualDurationSeconds: number;
        totalBreakSeconds: number;
    }>;
    completeSession(userId: string, sessionId: string, dto: CompleteStudySessionDto): Promise<{
        session: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.StudySessionStatus;
            notes: string | null;
            userId: string;
            subjectId: string | null;
            clientId: string;
            topicId: string | null;
            completedTasksCount: number;
            startTime: Date;
            endTime: Date | null;
            actualDurationSeconds: number;
            totalBreakSeconds: number;
        };
        netStudySeconds: number;
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
    getSessionHistory(userId: string): Promise<{
        sessions: ({
            subject: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                icon: string | null;
                classId: string | null;
                academicYearId: string | null;
                userId: string;
                colorHex: string;
                targetWeeklyMinutes: number;
                isArchived: boolean;
            } | null;
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
            } | null;
            breaks: {
                id: string;
                studySessionId: string;
                breakStart: Date;
                breakEnd: Date | null;
                durationSeconds: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.StudySessionStatus;
            notes: string | null;
            userId: string;
            subjectId: string | null;
            clientId: string;
            topicId: string | null;
            completedTasksCount: number;
            startTime: Date;
            endTime: Date | null;
            actualDurationSeconds: number;
            totalBreakSeconds: number;
        })[];
        dailyStats: {
            id: string;
            updatedAt: Date;
            userId: string;
            totalBreakSeconds: number;
            statDate: Date;
            totalStudySeconds: number;
            sessionsCompleted: number;
            tasksCompleted: number;
            streakDays: number;
        }[];
    }>;
}
