"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiAiProvider = void 0;
const common_1 = require("@nestjs/common");
let GeminiAiProvider = class GeminiAiProvider {
    providerName = 'google-gemini';
    simulatedFailure = false;
    setSimulatedFailureForTesting(shouldFail) {
        this.simulatedFailure = shouldFail;
    }
    async generateCompletion(request) {
        const start = Date.now();
        if (this.simulatedFailure) {
            throw new common_1.ServiceUnavailableException('Primary Gemini provider temporarily unreachable');
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
};
exports.GeminiAiProvider = GeminiAiProvider;
exports.GeminiAiProvider = GeminiAiProvider = __decorate([
    (0, common_1.Injectable)()
], GeminiAiProvider);
//# sourceMappingURL=gemini.provider.js.map