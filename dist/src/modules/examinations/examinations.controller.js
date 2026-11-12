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
exports.ExaminationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const examinations_service_1 = require("./examinations.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const examination_dto_1 = require("./dto/examination.dto");
let ExaminationsController = class ExaminationsController {
    examinationsService;
    constructor(examinationsService) {
        this.examinationsService = examinationsService;
    }
    list(user) {
        return this.examinationsService.listExams(user.id);
    }
    listUpcoming(user) {
        return this.examinationsService.listUpcomingExams(user.id);
    }
    create(user, dto) {
        return this.examinationsService.createExam(user.id, dto);
    }
    getOne(user, id) {
        return this.examinationsService.getExamById(user.id, id);
    }
    update(user, id, dto) {
        return this.examinationsService.updateExam(user.id, id, dto);
    }
    remove(user, id) {
        return this.examinationsService.deleteExam(user.id, id);
    }
    recordResults(user, id, dto) {
        return this.examinationsService.recordResults(user.id, id, dto);
    }
};
exports.ExaminationsController = ExaminationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all examinations and schedules for the student' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExaminationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    (0, swagger_1.ApiOperation)({ summary: 'List upcoming examinations ordered by start date' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExaminationsController.prototype, "listUpcoming", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create an examination with subject-wise schedules' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, examination_dto_1.CreateExamDto]),
    __metadata("design:returntype", void 0)
], ExaminationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve examination details, schedules, and results' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ExaminationsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update examination metadata or dates' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ExaminationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an examination owned by the student' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ExaminationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/results'),
    (0, swagger_1.ApiOperation)({ summary: 'Record subject-wise marks and calculate overall grade and percentage' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, examination_dto_1.RecordExamResultsDto]),
    __metadata("design:returntype", void 0)
], ExaminationsController.prototype, "recordResults", null);
exports.ExaminationsController = ExaminationsController = __decorate([
    (0, swagger_1.ApiTags)('Examinations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('exams'),
    __metadata("design:paramtypes", [examinations_service_1.ExaminationsService])
], ExaminationsController);
//# sourceMappingURL=examinations.controller.js.map