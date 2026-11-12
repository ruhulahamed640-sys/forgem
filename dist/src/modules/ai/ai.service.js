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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const gemini_provider_1 = require("../../integrations/ai/gemini.provider");
const fallback_ai_provider_1 = require("../../integrations/ai/fallback-ai.provider");
let AiService = class AiService {
    prisma;
    geminiProvider;
    fallbackProvider;
    constructor(prisma, geminiProvider, fallbackProvider) {
        this.prisma = prisma;
        this.geminiProvider = geminiProvider;
        this.fallbackProvider = fallbackProvider;
    }
    async verifyAndGetRemainingQuota(userId) {
        const startOfUtcDay = new Date();
        startOfUtcDay.setUTCHours(0, 0, 0, 0);
        const [activeSub, usageAgg] = await Promise.all([
            this.prisma.subscription.findFirst({
                where: { userId, status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } },
                include: { plan: true },
            }),
            this.prisma.aiUsageLog.aggregate({
                where: { userId, isSuccess: true, createdAt: { gte: startOfUtcDay } },
                _sum: { totalTokens: true },
            }),
        ]);
        const dailyLimit = activeSub?.plan?.dailyAiTokenLimit ||
            parseInt(process.env.AI_FREE_DAILY_TOKEN_LIMIT || '25000', 10);
        const usedToday = usageAgg._sum.totalTokens || 0;
        if (usedToday >= dailyLimit) {
            throw new common_1.ForbiddenException({
                message: 'Daily AI token usage limit reached for your current subscription tier',
                code: 'AI_QUOTA_EXCEEDED',
            });
        }
        return {
            dailyLimit,
            usedToday,
            remainingTokens: Math.max(0, dailyLimit - usedToday),
            planCode: activeSub?.plan?.code || 'FREE_TIER',
        };
    }
    async executeWithProviderFallback(userId, feature, systemPrompt, userPrompt) {
        await this.verifyAndGetRemainingQuota(userId);
        let isFallback = false;
        let response;
        try {
            response = await this.geminiProvider.generateCompletion({
                systemPrompt,
                userPrompt,
            });
        }
        catch (primaryErr) {
            await this.prisma.aiUsageLog.create({
                data: {
                    userId,
                    feature,
                    provider: this.geminiProvider.providerName,
                    model: process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.5-flash',
                    isFallback: false,
                    isSuccess: false,
                    errorCode: 'PRIMARY_PROVIDER_ERROR',
                },
            });
            isFallback = true;
            response = await this.fallbackProvider.generateCompletion({
                systemPrompt,
                userPrompt,
            });
        }
        await this.prisma.aiUsageLog.create({
            data: {
                userId,
                feature,
                provider: response.provider,
                model: response.model,
                promptTokens: response.promptTokens,
                completionTokens: response.completionTokens,
                totalTokens: response.totalTokens,
                latencyMs: response.latencyMs,
                isFallback,
                isSuccess: true,
            },
        });
        return { ...response, isFallback };
    }
    async chat(userId, dto) {
        const completion = await this.executeWithProviderFallback(userId, 'AI_CHAT', 'You are StudyPilot AI, a rigorous academic tutor.', dto.prompt);
        const conversation = dto.conversationId
            ? await this.prisma.aiConversation.findUnique({ where: { id: dto.conversationId } })
            : await this.prisma.aiConversation.create({
                data: {
                    userId,
                    subjectId: dto.subjectId,
                    title: dto.prompt.slice(0, 80),
                },
            });
        const convId = conversation.id;
        await this.prisma.aiMessage.createMany({
            data: [
                {
                    conversationId: convId,
                    role: 'user',
                    content: dto.prompt,
                    promptTokens: completion.promptTokens,
                    providerUsed: completion.provider,
                },
                {
                    conversationId: convId,
                    role: 'assistant',
                    content: completion.content,
                    completionTokens: completion.completionTokens,
                    totalTokens: completion.totalTokens,
                    providerUsed: completion.provider,
                },
            ],
        });
        return {
            conversationId: convId,
            reply: completion.content,
            providerUsed: completion.provider,
            isFallback: completion.isFallback,
            tokensUsed: completion.totalTokens,
        };
    }
    async generateValidatedStudyPlan(userId, dto) {
        const completion = await this.executeWithProviderFallback(userId, 'GENERATE_STUDY_PLAN', 'JSON_STUDY_PLAN: Output strictly valid JSON with title, targetMinutes, and tasks[].', `Goal: ${dto.goalFocus}, Daily minutes: ${dto.dailyAvailableMinutes}`);
        let parsed;
        try {
            parsed = JSON.parse(completion.content);
        }
        catch {
            throw new common_1.BadRequestException({
                message: 'AI output failed JSON schema validation',
                code: 'AI_PLAN_VALIDATION_FAILED',
            });
        }
        if (!parsed ||
            typeof parsed.title !== 'string' ||
            !Array.isArray(parsed.tasks) ||
            parsed.tasks.length === 0) {
            throw new common_1.BadRequestException({
                message: 'AI study plan missing required tasks array or title',
                code: 'AI_PLAN_STRUCTURE_INVALID',
            });
        }
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        const savedPlan = await this.prisma.$transaction(async (tx) => {
            await tx.aiGenerationJob.create({
                data: {
                    userId,
                    jobType: 'STUDY_PLAN_GENERATION',
                    status: 'COMPLETED',
                    inputPayload: dto,
                    outputPayload: parsed,
                    isValidated: true,
                    completedAt: new Date(),
                },
            });
            return tx.studyPlan.create({
                data: {
                    userId,
                    title: parsed.title,
                    description: `AI-generated plan for: ${dto.goalFocus}`,
                    periodType: 'WEEKLY',
                    startDate,
                    endDate,
                    targetMinutes: Number(parsed.targetMinutes) || dto.dailyAvailableMinutes * 7,
                    isAiGenerated: true,
                    tasks: {
                        create: parsed.tasks.map((t, idx) => ({
                            subjectId: dto.subjectIds?.[0] || undefined,
                            title: String(t.title || `Study Block ${idx + 1}`),
                            scheduledDate: new Date(startDate.getTime() + Number(t.dayOffset ?? idx) * 86400 * 1000),
                            durationMinutes: Math.max(15, Math.min(240, Number(t.durationMinutes) || 45)),
                            priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(t.priority)
                                ? t.priority
                                : 'MEDIUM',
                        })),
                    },
                },
                include: { tasks: true },
            });
        });
        return {
            plan: savedPlan,
            validated: true,
            providerUsed: completion.provider,
            isFallback: completion.isFallback,
        };
    }
    async summarize(userId, dto) {
        const completion = await this.executeWithProviderFallback(userId, 'TOPIC_SUMMARIZE', 'Summarize the academic material into key bullet points and revision takeaways.', dto.content);
        return {
            summary: completion.content,
            tokensUsed: completion.totalTokens,
            providerUsed: completion.provider,
        };
    }
    async explainTopic(userId, dto) {
        const completion = await this.executeWithProviderFallback(userId, 'EXPLAIN_TOPIC', `Explain the academic topic clearly for level: ${dto.academicLevel || 'UNIVERSITY'}.`, dto.topicTitle);
        return {
            explanation: completion.content,
            tokensUsed: completion.totalTokens,
            providerUsed: completion.provider,
        };
    }
    async getUsage(userId) {
        const [quota, recentLogs] = await Promise.all([
            this.verifyAndGetRemainingQuota(userId).catch((err) => ({
                dailyLimit: 25000,
                usedToday: 25000,
                remainingTokens: 0,
                planCode: 'FREE_TIER',
                quotaReached: true,
            })),
            this.prisma.aiUsageLog.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 30,
            }),
        ]);
        return { quota, recentLogs };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gemini_provider_1.GeminiAiProvider,
        fallback_ai_provider_1.FallbackAiProvider])
], AiService);
//# sourceMappingURL=ai.service.js.map