import { PrismaService } from '../../database/prisma/prisma.service';
import { GeminiAiProvider } from '../../integrations/ai/gemini.provider';
import { FallbackAiProvider } from '../../integrations/ai/fallback-ai.provider';
import { AiChatDto, AiExplainTopicDto, AiSummarizeDto, GenerateAiStudyPlanDto } from './dto/ai.dto';
export declare class AiService {
    private readonly prisma;
    private readonly geminiProvider;
    private readonly fallbackProvider;
    constructor(prisma: PrismaService, geminiProvider: GeminiAiProvider, fallbackProvider: FallbackAiProvider);
    verifyAndGetRemainingQuota(userId: string): Promise<{
        dailyLimit: number;
        usedToday: number;
        remainingTokens: number;
        planCode: string;
    }>;
    private executeWithProviderFallback;
    chat(userId: string, dto: AiChatDto): Promise<{
        conversationId: string;
        reply: string;
        providerUsed: string;
        isFallback: boolean;
        tokensUsed: number;
    }>;
    generateValidatedStudyPlan(userId: string, dto: GenerateAiStudyPlanDto): Promise<{
        plan: {
            tasks: {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                status: import(".prisma/client").$Enums.TaskStatus;
                subjectId: string | null;
                completedAt: Date | null;
                priority: import(".prisma/client").$Enums.PriorityLevel;
                durationMinutes: number;
                scheduledDate: Date;
                rescheduledFromDate: Date | null;
                studyPlanId: string;
            }[];
        } & {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            title: string;
            userId: string;
            completionPercentage: import("@prisma/client/runtime/library").Decimal;
            periodType: import(".prisma/client").$Enums.PlanPeriodType;
            targetMinutes: number;
            completedMinutes: number;
            isAiGenerated: boolean;
        };
        validated: boolean;
        providerUsed: string;
        isFallback: boolean;
    }>;
    summarize(userId: string, dto: AiSummarizeDto): Promise<{
        summary: string;
        tokensUsed: number;
        providerUsed: string;
    }>;
    explainTopic(userId: string, dto: AiExplainTopicDto): Promise<{
        explanation: string;
        tokensUsed: number;
        providerUsed: string;
    }>;
    getUsage(userId: string): Promise<{
        quota: {
            dailyLimit: number;
            usedToday: number;
            remainingTokens: number;
            planCode: string;
        } | {
            dailyLimit: number;
            usedToday: number;
            remainingTokens: number;
            planCode: string;
            quotaReached: boolean;
        };
        recentLogs: {
            id: string;
            createdAt: Date;
            userId: string;
            model: string;
            promptTokens: number;
            completionTokens: number;
            provider: string;
            totalTokens: number;
            latencyMs: number;
            isSuccess: boolean;
            feature: string;
            isFallback: boolean;
            errorCode: string | null;
        }[];
    }>;
}
