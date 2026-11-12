import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  AiCompletionRequest,
  AiCompletionResponse,
  IAiProviderAdapter,
} from './ai-provider.interface';

@Injectable()
export class GeminiAiProvider implements IAiProviderAdapter {
  public readonly providerName = 'google-gemini';
  private simulatedFailure = false;

  public setSimulatedFailureForTesting(shouldFail: boolean): void {
    this.simulatedFailure = shouldFail;
  }

  async generateCompletion(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    const start = Date.now();
    if (this.simulatedFailure) {
      throw new ServiceUnavailableException('Primary Gemini provider temporarily unreachable');
    }

    const model = process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.5-flash';
    const promptTokens = Math.max(12, Math.ceil((request.systemPrompt.length + request.userPrompt.length) / 4));

    let content = `Structured academic response for: ${request.userPrompt.slice(0, 120)}`;
    if (request.systemPrompt.includes('JSON_STUDY_PLAN')) {
      content = JSON.stringify({
        title: 'AI Optimized 7-Day Study Plan',
        targetMinutes: 420,
        tasks: [
          {
            title: 'Core Concepts Deep Dive & Active Recall',
            durationMinutes: 60,
            priority: 'HIGH',
            dayOffset: 0,
          },
          {
            title: 'Practice Problem Set & Past Paper Analysis',
            durationMinutes: 60,
            priority: 'MEDIUM',
            dayOffset: 1,
          },
        ],
      });
    }

    const completionTokens = Math.max(20, Math.ceil(content.length / 4));
    return {
      provider: this.providerName,
      model,
      content,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      latencyMs: Math.max(5, Date.now() - start),
    };
  }
}
