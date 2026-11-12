export interface AiCompletionRequest {
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
    temperature?: number;
}
export interface AiCompletionResponse {
    provider: string;
    model: string;
    content: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
}
export interface IAiProviderAdapter {
    readonly providerName: string;
    generateCompletion(request: AiCompletionRequest): Promise<AiCompletionResponse>;
}
