import { AiCompletionRequest, AiCompletionResponse, IAiProviderAdapter } from './ai-provider.interface';
export declare class GeminiAiProvider implements IAiProviderAdapter {
    readonly providerName = "google-gemini";
    private simulatedFailure;
    setSimulatedFailureForTesting(shouldFail: boolean): void;
    generateCompletion(request: AiCompletionRequest): Promise<AiCompletionResponse>;
}
