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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getOverview(user) {
        return this.analyticsService.getOverview(user.id);
    }
    getStudyTime(user) {
        return this.analyticsService.getStudyTimeAnalytics(user.id);
    }
    getSubjectProgress(user) {
        return this.analyticsService.getSubjectProgressAnalytics(user.id);
    }
    getAssignmentPerformance(user) {
        return this.analyticsService.getAssignmentPerformance(user.id);
    }
    getExamPerformance(user) {
        return this.analyticsService.getExamPerformance(user.id);
    }
    getWeeklyReport(user) {
        return this.analyticsService.getWeeklyReport(user.id);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve comprehensive student productivity and academic dashboard overview' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('study-time'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve 30-day study time and break breakdown' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getStudyTime", null);
__decorate([
    (0, common_1.Get)('subject-progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve completion percentage and study time per subject' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getSubjectProgress", null);
__decorate([
    (0, common_1.Get)('assignment-performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve assignment completion and on-time submission metrics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getAssignmentPerformance", null);
__decorate([
    (0, common_1.Get)('exam-performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve historical examination scores and subject mark trends' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getExamPerformance", null);
__decorate([
    (0, common_1.Get)('weekly-report'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve consolidated weekly academic & productivity report' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getWeeklyReport", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map