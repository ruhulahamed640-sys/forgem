import { AiCompletionRequest, AiCompletionResponse, IAiProviderAdapter } from './ai-provider.interface';
export declare class FallbackAiProvider implements IAiProviderAdapter {
    readonly providerName = "fallback-secondary-llm";
    generateCompletion(request: AiCompletionRequest): Promise<AiCompletionResponse>;
}
