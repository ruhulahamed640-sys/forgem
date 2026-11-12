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
exports.ChaptersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const subjects_service_1 = require("../subjects/subjects.service");
let ChaptersService = class ChaptersService {
    prisma;
    subjectsService;
    constructor(prisma, subjectsService) {
        this.prisma = prisma;
        this.subjectsService = subjectsService;
    }
    async createChapter(userId, dto) {
        await this.subjectsService.getSubjectById(userId, dto.subjectId);
        const chapter = await this.prisma.chapter.create({
            data: {
                subjectId: dto.subjectId,
                title: dto.title.trim(),
                orderIndex: dto.orderIndex,
                description: dto.description,
                estimatedMinutes: dto.estimatedMinutes || 60,
            },
        });
        await this.subjectsService.recalculateSubjectProgress(userId, dto.subjectId);
        return chapter;
    }
    async completeChapter(userId, chapterId) {
        const chapter = await this.prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { subject: true },
        });
        if (!chapter)
            throw new common_1.NotFoundException('Chapter not found');
        if (chapter.subject.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied: you do not own this chapter');
        }
        const updated = await this.prisma.chapter.update({
            where: { id: chapterId },
            data: { isCompleted: true, completedAt: new Date() },
        });
        await this.subjectsService.recalculateSubjectProgress(userId, chapter.subjectId);
        return updated;
    }
    async createTopic(userId, dto) {
        const chapter = await this.prisma.chapter.findUnique({
            where: { id: dto.chapterId },
            include: { subject: true },
        });
        if (!chapter)
            throw new common_1.NotFoundException('Chapter not found');
        if (chapter.subject.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied: you do not own this chapter');
        }
        const topic = await this.prisma.topic.create({
            data: {
                chapterId: dto.chapterId,
                title: dto.title.trim(),
                orderIndex: dto.orderIndex,
                difficultyLevel: dto.difficultyLevel || 3,
            },
        });
        await this.subjectsService.recalculateSubjectProgress(userId, chapter.subjectId);
        return topic;
    }
};
exports.ChaptersService = ChaptersService;
exports.ChaptersService = ChaptersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subjects_service_1.SubjectsService])
], ChaptersService);
//# sourceMappingURL=chapters.service.js.map