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
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
const rewards_service_1 = require("../rewards/rewards.service");
let AssignmentsService = class AssignmentsService {
    prisma;
    rewardsService;
    constructor(prisma, rewardsService) {
        this.prisma = prisma;
        this.rewardsService = rewardsService;
    }
    async listAssignments(userId, filters) {
        const page = Math.max(1, Number(filters?.page || 1));
        const limit = Math.min(100, Math.max(1, Number(filters?.limit || 20)));
        const skip = (page - 1) * limit;
        await this.prisma.assignment.updateMany({
            where: {
                userId,
                status: { in: ['PENDING', 'IN_PROGRESS'] },
                deadline: { lt: new Date() },
            },
            data: { isOverdue: true, status: 'OVERDUE' },
        });
        const where = { userId };
        if (filters?.status)
            where.status = filters.status;
        if (filters?.subjectId)
            where.subjectId = filters.subjectId;
        const [items, total] = await Promise.all([
            this.prisma.assignment.findMany({
                where,
                include: { subject: true, attachments: true, reminders: true },
                orderBy: { deadline: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.assignment.count({ where }),
        ]);
        return {
            data: items,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async createAssignment(userId, dto) {
        const subject = await this.prisma.subject.findUnique({
            where: { id: dto.subjectId },
        });
        if (!subject || subject.userId !== userId) {
            throw new common_1.ForbiddenException({
                message: 'Subject not found or not owned by user',
                code: 'SUBJECT_OWNERSHIP_VIOLATION',
            });
        }
        const deadlineDate = new Date(dto.deadline);
        const remindAt = new Date(deadlineDate.getTime() - 24 * 3600 * 1000);
        return this.prisma.$transaction(async (tx) => {
            const assignment = await tx.assignment.create({
                data: {
                    userId,
                    subjectId: dto.subjectId,
                    title: dto.title.trim(),
                    description: dto.description,
                    deadline: deadlineDate,
                    priority: dto.priority || 'MEDIUM',
                    assignmentSubjects: {
                        create: { subjectId: dto.subjectId, isPrimary: true },
                    },
                    reminders: remindAt > new Date()
                        ? {
                            create: {
                                remindAt,
                                channel: 'IN_APP',
                            },
                        }
                        : undefined,
                },
                include: { subject: true, reminders: true },
            });
            return assignment;
        });
    }
    async getAssignmentById(userId, assignmentId) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                subject: true,
                attachments: true,
                submissions: true,
                comments: true,
                reminders: true,
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException({
                message: 'Assignment not found',
                code: 'ASSIGNMENT_NOT_FOUND',
            });
        }
        if (assignment.userId !== userId) {
            throw new common_1.ForbiddenException({
                message: 'Access denied: you do not own this assignment',
                code: 'ASSIGNMENT_OWNERSHIP_VIOLATION',
            });
        }
        return assignment;
    }
    async updateAssignment(userId, assignmentId, dto) {
        await this.getAssignmentById(userId, assignmentId);
        return this.prisma.assignment.update({
            where: { id: assignmentId },
            data: {
                ...dto,
                deadline: dto.deadline ? new Date(dto.deadline) : undefined,
            },
        });
    }
    async deleteAssignment(userId, assignmentId) {
        await this.getAssignmentById(userId, assignmentId);
        await this.prisma.assignment.delete({ where: { id: assignmentId } });
        return { deleted: true, id: assignmentId };
    }
    async completeAssignment(userId, assignmentId, notes) {
        const assignment = await this.getAssignmentById(userId, assignmentId);
        if (assignment.status === 'COMPLETED' || assignment.status === 'GRADED') {
            throw new common_1.BadRequestException({
                message: 'Assignment has already been completed',
                code: 'ASSIGNMENT_ALREADY_COMPLETED',
            });
        }
        const now = new Date();
        const completedOnTime = now <= assignment.deadline;
        const updatedAssignment = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.assignment.update({
                where: { id: assignmentId },
                data: {
                    status: 'COMPLETED',
                    completionPercentage: 100,
                    submittedAt: now,
                    completedAt: now,
                    isOverdue: !completedOnTime,
                },
            });
            await tx.assignmentSubmission.create({
                data: {
                    assignmentId,
                    userId,
                    notes: notes || 'Completed via StudyPilot',
                    submittedAt: now,
                },
            });
            await tx.notification.create({
                data: {
                    userId,
                    category: 'ASSIGNMENT_REMINDER',
                    title: `Assignment Completed: ${assignment.title}`,
                    body: completedOnTime
                        ? `Great work! You completed "${assignment.title}" ahead of the deadline.`
                        : `You completed "${assignment.title}" after the deadline.`,
                },
            });
            return updated;
        });
        const rewardOutcome = await this.rewardsService.processTrustedActivityEvent({
            userId,
            eventCode: completedOnTime ? 'ASSIGNMENT_COMPLETED' : 'ASSIGNMENT_COMPLETED_LATE',
            sourceEntityId: assignmentId,
            description: `Completed assignment: ${assignment.title}`,
        });
        return {
            assignment: updatedAssignment,
            completedOnTime,
            rewardOutcome,
        };
    }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rewards_service_1.RewardsService])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map