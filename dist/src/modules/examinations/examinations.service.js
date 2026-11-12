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
exports.ExaminationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let ExaminationsService = class ExaminationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateGradeFromPercentage(pct) {
        if (pct >= 90)
            return 'A+';
        if (pct >= 80)
            return 'A';
        if (pct >= 70)
            return 'B+';
        if (pct >= 60)
            return 'B';
        if (pct >= 50)
            return 'C';
        if (pct >= 40)
            return 'D';
        return 'F';
    }
    async listExams(userId) {
        return this.prisma.exam.findMany({
            where: { userId },
            include: {
                examSubjects: { include: { subject: true, schedules: true } },
                results: { include: { marks: true } },
            },
            orderBy: { startDate: 'asc' },
        });
    }
    async listUpcomingExams(userId) {
        return this.prisma.exam.findMany({
            where: {
                userId,
                startDate: { gte: new Date() },
                status: 'UPCOMING',
            },
            include: {
                examSubjects: { include: { subject: true, schedules: true } },
            },
            orderBy: { startDate: 'asc' },
        });
    }
    async createExam(userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const exam = await tx.exam.create({
                data: {
                    userId,
                    title: dto.title.trim(),
                    examType: dto.examType || 'MIDTERM',
                    description: dto.description,
                    startDate: new Date(dto.startDate),
                    endDate: new Date(dto.endDate),
                },
            });
            if (dto.subjects && dto.subjects.length > 0) {
                for (const sub of dto.subjects) {
                    const es = await tx.examSubject.create({
                        data: {
                            examId: exam.id,
                            subjectId: sub.subjectId,
                            maxMarks: sub.maxMarks,
                            passingMarks: sub.passingMarks,
                        },
                    });
                    if (sub.examDate) {
                        await tx.examSchedule.create({
                            data: {
                                examId: exam.id,
                                examSubjectId: es.id,
                                examDate: new Date(sub.examDate),
                            },
                        });
                    }
                }
            }
            return tx.exam.findUnique({
                where: { id: exam.id },
                include: { examSubjects: { include: { schedules: true } } },
            });
        });
    }
    async getExamById(userId, examId) {
        const exam = await this.prisma.exam.findUnique({
            where: { id: examId },
            include: {
                examSubjects: { include: { subject: true, schedules: true } },
                results: { include: { marks: true } },
            },
        });
        if (!exam) {
            throw new common_1.NotFoundException({ message: 'Examination not found', code: 'EXAM_NOT_FOUND' });
        }
        if (exam.userId !== userId) {
            throw new common_1.ForbiddenException({
                message: 'Access denied: you do not own this examination',
                code: 'EXAM_OWNERSHIP_VIOLATION',
            });
        }
        return exam;
    }
    async updateExam(userId, examId, dto) {
        await this.getExamById(userId, examId);
        return this.prisma.exam.update({
            where: { id: examId },
            data: {
                title: dto.title,
                description: dto.description,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            },
        });
    }
    async deleteExam(userId, examId) {
        await this.getExamById(userId, examId);
        await this.prisma.exam.delete({ where: { id: examId } });
        return { deleted: true, id: examId };
    }
    async recordResults(userId, examId, dto) {
        const exam = await this.getExamById(userId, examId);
        if (!dto.marks || dto.marks.length === 0) {
            throw new common_1.BadRequestException({
                message: 'At least one subject mark entry is required',
                code: 'EMPTY_EXAM_MARKS',
            });
        }
        let totalObtained = 0;
        let totalMax = 0;
        for (const m of dto.marks) {
            if (m.marksObtained < 0 || m.marksObtained > m.maxMarks || m.maxMarks <= 0) {
                throw new common_1.BadRequestException({
                    message: 'Invalid marks: marksObtained must be between 0 and maxMarks',
                    code: 'INVALID_EXAM_MARKS',
                });
            }
            totalObtained += m.marksObtained;
            totalMax += m.maxMarks;
        }
        const overallPct = Math.round((totalObtained / totalMax) * 10000) / 100;
        const overallGrade = this.calculateGradeFromPercentage(overallPct);
        return this.prisma.$transaction(async (tx) => {
            const result = await tx.examResult.upsert({
                where: { examId_userId: { examId, userId } },
                update: {
                    totalMarksObtained: totalObtained,
                    totalMaxMarks: totalMax,
                    percentage: overallPct,
                    overallGrade,
                    remarks: dto.remarks,
                },
                create: {
                    examId,
                    userId,
                    totalMarksObtained: totalObtained,
                    totalMaxMarks: totalMax,
                    percentage: overallPct,
                    overallGrade,
                    remarks: dto.remarks,
                },
            });
            for (const m of dto.marks) {
                let examSub = exam.examSubjects.find((es) => es.subjectId === m.subjectId);
                if (!examSub) {
                    examSub = await tx.examSubject.create({
                        data: {
                            examId,
                            subjectId: m.subjectId,
                            maxMarks: m.maxMarks,
                            passingMarks: m.maxMarks * 0.4,
                        },
                        include: { subject: true, schedules: true },
                    });
                }
                const subPct = Math.round((m.marksObtained / m.maxMarks) * 10000) / 100;
                const subGrade = this.calculateGradeFromPercentage(subPct);
                await tx.examMark.upsert({
                    where: {
                        examResultId_examSubjectId: {
                            examResultId: result.id,
                            examSubjectId: examSub.id,
                        },
                    },
                    update: {
                        marksObtained: m.marksObtained,
                        maxMarks: m.maxMarks,
                        percentage: subPct,
                        grade: subGrade,
                    },
                    create: {
                        examResultId: result.id,
                        examSubjectId: examSub.id,
                        marksObtained: m.marksObtained,
                        maxMarks: m.maxMarks,
                        percentage: subPct,
                        grade: subGrade,
                    },
                });
            }
            await tx.exam.update({
                where: { id: examId },
                data: { status: 'COMPLETED', preparationProgress: 100 },
            });
            return tx.examResult.findUnique({
                where: { id: result.id },
                include: { marks: true },
            });
        });
    }
};
exports.ExaminationsService = ExaminationsService;
exports.ExaminationsService = ExaminationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExaminationsService);
//# sourceMappingURL=examinations.service.js.map