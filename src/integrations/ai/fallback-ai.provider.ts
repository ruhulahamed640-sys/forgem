import { Injectable } from '@nestjs/common';
import {
  AiCompletionRequest,
  AiCompletionResponse,
  IAiProviderAdapter,
} from './ai-provider.interface';

@Injectable()
export class FallbackAiProvider implements IAiProviderAdapter {
  public readonly providerName = 'fallback-secondary-llm';

  async generateCompletion(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    const start = Date.now();
    const promptTokens = Math.max(10, Math.ceil(request.userPrompt.length / 4));
    const content = request.systemPrompt.includes('JSON_STUDY_PLAN')
      ? JSON.stringify({
          title: 'Fallback Verified Study Plan',
          targetMinutes: 300,
          tasks: [
            {
              title: 'Foundational Chapter Review',
              durationMinutes: 45,
              priority: 'HIGH',
              dayOffset: 0,
            },
          ],
        })
      : `[Fallback Provider] Academic synthesis for: ${request.userPrompt.slice(0, 100)}`;

    const completionTokens = Math.max(15, Math.ceil(content.length / 4));
    return {
      provider: this.providerName,
      model: 'fallback-instruct-v1',
      content,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      latencyMs: Math.max(5, Date.now() - start),
    };
  }
}
