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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteRevisionDto = exports.CreateRevisionDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class CreateRevisionDto {
    topicId;
    algorithm;
    scheduledFor;
}
exports.CreateRevisionDto = CreateRevisionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRevisionDto.prototype, "topicId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.SpacedRepetitionAlgorithm }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SpacedRepetitionAlgorithm),
    __metadata("design:type", String)
], CreateRevisionDto.prototype, "algorithm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateRevisionDto.prototype, "scheduledFor", void 0);
class CompleteRevisionDto {
    difficultyRating;
    durationMinutes;
    notes;
}
exports.CompleteRevisionDto = CompleteRevisionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Difficulty rating from 1 (very easy) to 5 (very hard)', example: 2 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CompleteRevisionDto.prototype, "difficultyRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Duration of revision session in minutes', example: 25 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(480),
    __metadata("design:type", Number)
], CompleteRevisionDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteRevisionDto.prototype, "notes", void 0);
//# sourceMappingURL=revision.dto.js.map