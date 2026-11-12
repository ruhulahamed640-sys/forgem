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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("./ai.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const ai_dto_1 = require("./dto/ai.dto");
let AiController = class AiController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    chat(user, dto) {
        return this.aiService.chat(user.id, dto);
    }
    generatePlan(user, dto) {
        return this.aiService.generateValidatedStudyPlan(user.id, dto);
    }
    summarize(user, dto) {
        return this.aiService.summarize(user.id, dto);
    }
    explainTopic(user, dto) {
        return this.aiService.explainTopic(user.id, dto);
    }
    getUsage(user) {
        return this.aiService.getUsage(user.id);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a prompt to the provider-independent AI study assistant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_dto_1.AiChatDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('generate-study-plan'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate, validate, and persist an AI-optimized study plan' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_dto_1.GenerateAiStudyPlanDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "generatePlan", null);
__decorate([
    (0, common_1.Post)('summarize'),
    (0, swagger_1.ApiOperation)({ summary: 'Summarize study notes or chapter materials' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_dto_1.AiSummarizeDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "summarize", null);
__decorate([
    (0, common_1.Post)('explain-topic'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate an academic explanation for a topic or assignment concept' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_dto_1.AiExplainTopicDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "explainTopic", null);
__decorate([
    (0, common_1.Get)('usage'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve current daily AI token usage and remaining plan quota' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getUsage", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI Study Assistant'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map