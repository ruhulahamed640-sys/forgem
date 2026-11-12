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
exports.StudySessionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const study_sessions_service_1 = require("./study-sessions.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const study_session_dto_1 = require("./dto/study-session.dto");
let StudySessionsController = class StudySessionsController {
    studySessionsService;
    constructor(studySessionsService) {
        this.studySessionsService = studySessionsService;
    }
    start(user, dto) {
        return this.studySessionsService.startSession(user.id, dto);
    }
    pause(user, id) {
        return this.studySessionsService.pauseSession(user.id, id);
    }
    resume(user, id) {
        return this.studySessionsService.resumeSession(user.id, id);
    }
    complete(user, id, dto) {
        return this.studySessionsService.completeSession(user.id, id, dto);
    }
    getHistory(user) {
        return this.studySessionsService.getSessionHistory(user.id);
    }
};
exports.StudySessionsController = StudySessionsController;
__decorate([
    (0, common_1.Post)('start'),
    (0, swagger_1.ApiOperation)({ summary: 'Start a server-timed study session (prevents concurrent active sessions)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, study_session_dto_1.StartStudySessionDto]),
    __metadata("design:returntype", void 0)
], StudySessionsController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    (0, swagger_1.ApiOperation)({ summary: 'Pause an active study session and begin tracking break duration' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StudySessionsController.prototype, "pause", null);
__decorate([
    (0, common_1.Post)(':id/resume'),
    (0, swagger_1.ApiOperation)({ summary: 'Resume a paused study session and finalize break interval' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StudySessionsController.prototype, "resume", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete study session using server timestamps, update statistics, and evaluate points' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, study_session_dto_1.CompleteStudySessionDto]),
    __metadata("design:returntype", void 0)
], StudySessionsController.prototype, "complete", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve student study session logs and daily study statistics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudySessionsController.prototype, "getHistory", null);
exports.StudySessionsController = StudySessionsController = __decorate([
    (0, swagger_1.ApiTags)('Study Sessions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('study-sessions'),
    __metadata("design:paramtypes", [study_sessions_service_1.StudySessionsService])
], StudySessionsController);
//# sourceMappingURL=study-sessions.controller.js.map