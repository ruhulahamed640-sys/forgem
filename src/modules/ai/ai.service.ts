import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { GeminiAiProvider } from '../../integrations/ai/gemini.provider';
import { FallbackAiProvider } from '../../integrations/ai/fallback-ai.provider';
import {
  AiChatDto,
  AiExplainTopicDto,
  AiSummarizeDto,
  GenerateAiStudyPlanDto,
} from './dto/ai.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiProvider: GeminiAiProvider,
    private readonly fallbackProvider: FallbackAiProvider,
  ) {}

  /**
   * Enforces daily token usage quotas based on the user's active subscription plan.
   */
  async verifyAndGetRemainingQuota(userId: string) {
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

    const dailyLimit =
      activeSub?.plan?.dailyAiTokenLimit ||
      parseInt(process.env.AI_FREE_DAILY_TOKEN_LIMIT || '25000', 10);
    const usedToday = usageAgg._sum.totalTokens || 0;

    if (usedToday >= dailyLimit) {
      throw new ForbiddenException({
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

  private async executeWithProviderFallback(
    userId: string,
    feature: string,
    systemPrompt: string,
    userPrompt: string,
  ) {
    await this.verifyAndGetRemainingQuota(userId);

    let isFallback = false;
    let response;
    try {
      response = await this.geminiProvider.generateCompletion({
        systemPrompt,
        userPrompt,
      });
    } catch (primaryErr: any) {
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
      // Automatic failover to secondary provider
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

  async chat(userId: string, dto: AiChatDto) {
    const completion = await this.executeWithProviderFallback(
      userId,
      'AI_CHAT',
      'You are StudyPilot AI, a rigorous academic tutor.',
      dto.prompt,
    );

    const conversation = dto.conversationId
      ? await this.prisma.aiConversation.findUnique({ where: { id: dto.conversationId } })
      : await this.prisma.aiConversation.create({
          data: {
            userId,
            subjectId: dto.subjectId,
            title: dto.prompt.slice(0, 80),
          },
        });

    const convId = conversation!.id;
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

  /**
   * Generates an AI Study Plan, validates the structured JSON schema,
   * and persists it to study_plans & study_plan_tasks only after passing validation.
   */
  async generateValidatedStudyPlan(userId: string, dto: GenerateAiStudyPlanDto) {
    const completion = await this.executeWithProviderFallback(
      userId,
      'GENERATE_STUDY_PLAN',
      'JSON_STUDY_PLAN: Output strictly valid JSON with title, targetMinutes, and tasks[].',
      `Goal: ${dto.goalFocus}, Daily minutes: ${dto.dailyAvailableMinutes}`,
    );

    let parsed: any;
    try {
      parsed = JSON.parse(completion.content);
    } catch {
      throw new BadRequestException({
        message: 'AI output failed JSON schema validation',
        code: 'AI_PLAN_VALIDATION_FAILED',
      });
    }

    if (
      !parsed ||
      typeof parsed.title !== 'string' ||
      !Array.isArray(parsed.tasks) ||
      parsed.tasks.length === 0
    ) {
      throw new BadRequestException({
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
          inputPayload: dto as any,
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
            create: parsed.tasks.map((t: any, idx: number) => ({
              subjectId: dto.subjectIds?.[0] || undefined,
              title: String(t.title || `Study Block ${idx + 1}`),
              scheduledDate: new Date(
                startDate.getTime() + Number(t.dayOffset ?? idx) * 86400 * 1000,
              ),
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

  async summarize(userId: string, dto: AiSummarizeDto) {
    const completion = await this.executeWithProviderFallback(
      userId,
      'TOPIC_SUMMARIZE',
      'Summarize the academic material into key bullet points and revision takeaways.',
      dto.content,
    );
    return {
      summary: completion.content,
      tokensUsed: completion.totalTokens,
      providerUsed: completion.provider,
    };
  }

  async explainTopic(userId: string, dto: AiExplainTopicDto) {
    const completion = await this.executeWithProviderFallback(
      userId,
      'EXPLAIN_TOPIC',
      `Explain the academic topic clearly for level: ${dto.academicLevel || 'UNIVERSITY'}.`,
      dto.topicTitle,
    );
    return {
      explanation: completion.content,
      tokensUsed: completion.totalTokens,
      providerUsed: completion.provider,
    };
  }

  async getUsage(userId: string) {
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
}
