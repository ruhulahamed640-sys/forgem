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
exports.SubjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let SubjectsService = class SubjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listSubjects(userId) {
        return this.prisma.subject.findMany({
            where: { userId, isArchived: false },
            include: {
                chapters: {
                    orderBy: { orderIndex: 'asc' },
                    include: { topics: { orderBy: { orderIndex: 'asc' } } },
                },
                subjectProgress: { where: { userId } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async createSubject(userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const subject = await tx.subject.create({
                data: {
                    userId,
                    name: dto.name.trim(),
                    code: dto.code,
                    colorHex: dto.colorHex || '#4F46E5',
                    targetWeeklyMinutes: dto.targetWeeklyMinutes || 180,
                },
            });
            await tx.studentSubjectProgress.create({
                data: {
                    userId,
                    subjectId: subject.id,
                },
            });
            return subject;
        });
    }
    async getSubjectById(userId, subjectId) {
        const subject = await this.prisma.subject.findUnique({
            where: { id: subjectId },
            include: {
                chapters: {
                    orderBy: { orderIndex: 'asc' },
                    include: { topics: { orderBy: { orderIndex: 'asc' } } },
                },
                subjectProgress: { where: { userId } },
            },
        });
        if (!subject) {
            throw new common_1.NotFoundException({ message: 'Subject not found', code: 'SUBJECT_NOT_FOUND' });
        }
        if (subject.userId !== userId) {
            throw new common_1.ForbiddenException({
                message: 'Access denied: you do not own this subject',
                code: 'SUBJECT_OWNERSHIP_VIOLATION',
            });
        }
        return subject;
    }
    async updateSubject(userId, subjectId, dto) {
        await this.getSubjectById(userId, subjectId);
        return this.prisma.subject.update({
            where: { id: subjectId },
            data: dto,
        });
    }
    async deleteSubject(userId, subjectId) {
        await this.getSubjectById(userId, subjectId);
        await this.prisma.subject.delete({ where: { id: subjectId } });
        return { deleted: true, id: subjectId };
    }
    async recalculateSubjectProgress(userId, subjectId) {
        const chapters = await this.prisma.chapter.findMany({
            where: { subjectId },
            include: { topics: true },
        });
        const totalChapters = chapters.length;
        const completedChapters = chapters.filter((c) => c.isCompleted).length;
        const totalTopics = chapters.reduce((acc, c) => acc + c.topics.length, 0);
        const completionPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 10000) / 100 : 0;
        return this.prisma.studentSubjectProgress.upsert({
            where: { userId_subjectId: { userId, subjectId } },
            update: {
                totalChapters,
                completedChapters,
                totalTopics,
                completionPercentage,
                lastStudiedAt: new Date(),
            },
            create: {
                userId,
                subjectId,
                totalChapters,
                completedChapters,
                totalTopics,
                completionPercentage,
                lastStudiedAt: new Date(),
            },
        });
    }
};
exports.SubjectsService = SubjectsService;
exports.SubjectsService = SubjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubjectsService);
//# sourceMappingURL=subjects.service.js.map