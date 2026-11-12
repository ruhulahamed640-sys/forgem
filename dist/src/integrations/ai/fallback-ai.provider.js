"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallbackAiProvider = void 0;
const common_1 = require("@nestjs/common");
let FallbackAiProvider = class FallbackAiProvider {
    providerName = 'fallback-secondary-llm';
    async generateCompletion(request) {
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
};
exports.FallbackAiProvider = FallbackAiProvider;
exports.FallbackAiProvider = FallbackAiProvider = __decorate([
    (0, common_1.Injectable)()
], FallbackAiProvider);
//# sourceMappingURL=fallback-ai.provider.js.map