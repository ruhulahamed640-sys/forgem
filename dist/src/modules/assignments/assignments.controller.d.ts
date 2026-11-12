import { AssignmentsService } from './assignments.service';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment.dto';
export declare class AssignmentsController {
    private readonly assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    list(user: AuthenticatedUser, status?: string, subjectId?: string, page?: number, limit?: number): Promise<{
        data: ({
            subject: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                code: string | null;
                icon: string | null;
                classId: string | null;
                academicYearId: string | null;
                userId: string;
                colorHex: string;
                targetWeeklyMinutes: number;
                isArchived: boolean;
            };
            attachments: {
                id: string;
                createdAt: Date;
                assignmentId: string;
                uploadedById: string;
                fileName: string;
                mimeType: string;
                fileSizeBytes: number;
                storageKey: string;
            }[];
            reminders: {
                id: string;
                createdAt: Date;
                assignmentId: string;
                remindAt: Date;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                isSent: boolean;
                sentAt: Date | null;
                jobId: string | null;
            }[];
        } & {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            userId: string;
            subjectId: string;
            completedAt: Date | null;
            deadline: Date;
            priority: import(".prisma/client").$Enums.PriorityLevel;
            completionPercentage: number;
            submittedAt: Date | null;
            teacherFeedback: string | null;
            isOverdue: boolean;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    create(user: AuthenticatedUser, dto: CreateAssignmentDto): Promise<{
        subject: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            icon: string | null;
            classId: string | null;
            academicYearId: string | null;
            userId: string;
            colorHex: string;
            targetWeeklyMinutes: number;
            isArchived: boolean;
        };
        reminders: {
            id: string;
            createdAt: Date;
            assignmentId: string;
            remindAt: Date;
            channel: import(".prisma/client").$Enums.NotificationChannel;
            isSent: boolean;
            sentAt: Date | null;
            jobId: string | null;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.AssignmentStatus;
        userId: string;
        subjectId: string;
        completedAt: Date | null;
        deadline: Date;
        priority: import(".prisma/client").$Enums.PriorityLevel;
        completionPercentage: number;
        submittedAt: Date | null;
        teacherFeedback: string | null;
        isOverdue: boolean;
    }>;
    getOne(user: AuthenticatedUser, id: string): Promise<{
        submissions: {
            id: string;
            notes: string | null;
            userId: string;
            submittedAt: Date;
            teacherFeedback: string | null;
            assignmentId: string;
            attachmentKeys: import("@prisma/client/runtime/library").JsonValue | null;
            scoreObtained: import("@prisma/client/runtime/library").Decimal | null;
            maxScore: import("@prisma/client/runtime/library").Decimal | null;
        }[];
        subject: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            code: string | null;
            icon: string | null;
            classId: string | null;
            academicYearId: string | null;
            userId: string;
            colorHex: string;
            targetWeeklyMinutes: number;
            isArchived: boolean;
        };
        attachments: {
            id: string;
            createdAt: Date;
            assignmentId: string;
            uploadedById: string;
            fileName: string;
            mimeType: string;
            fileSizeBytes: number;
            storageKey: string;
        }[];
        comments: {
            id: string;
            createdAt: Date;
            userId: string;
            body: string;
            assignmentId: string;
            authorRole: import(".prisma/client").$Enums.RoleName;
        }[];
        reminders: {
            id: string;
            createdAt: Date;
            assignmentId: string;
            remindAt: Date;
            channel: import(".prisma/client").$Enums.NotificationChannel;
            isSent: boolean;
            sentAt: Date | null;
            jobId: string | null;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.AssignmentStatus;
        userId: string;
        subjectId: string;
        completedAt: Date | null;
        deadline: Date;
        priority: import(".prisma/client").$Enums.PriorityLevel;
        completionPercentage: number;
        submittedAt: Date | null;
        teacherFeedback: string | null;
        isOverdue: boolean;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateAssignmentDto): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.AssignmentStatus;
        userId: string;
        subjectId: string;
        completedAt: Date | null;
        deadline: Date;
        priority: import(".prisma/client").$Enums.PriorityLevel;
        completionPercentage: number;
        submittedAt: Date | null;
        teacherFeedback: string | null;
        isOverdue: boolean;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    complete(user: AuthenticatedUser, id: string, notes?: string): Promise<{
        assignment: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            userId: string;
            subjectId: string;
            completedAt: Date | null;
            deadline: Date;
            priority: import(".prisma/client").$Enums.PriorityLevel;
            completionPercentage: number;
            submittedAt: Date | null;
            teacherFeedback: string | null;
            isOverdue: boolean;
        };
        completedOnTime: boolean;
        rewardOutcome: {
            awarded: boolean;
            pointsAwarded: number;
            balanceAfter: number;
            transaction: {
                id: string;
                description: string | null;
                createdAt: Date;
                eventCode: string;
                userId: string;
                idempotencyKey: string;
                transactionType: import(".prisma/client").$Enums.PointTransactionType;
                sourceEntityId: string;
                pointsDelta: number;
                balanceAfter: number;
            };
            unlockedAchievements: any[];
        } | {
            awarded: boolean;
            reason: string;
            transaction: {
                id: string;
                description: string | null;
                createdAt: Date;
                eventCode: string;
                userId: string;
                idempotencyKey: string;
                transactionType: import(".prisma/client").$Enums.PointTransactionType;
                sourceEntityId: string;
                pointsDelta: number;
                balanceAfter: number;
            };
        } | {
            awarded: boolean;
            reason: string;
            transaction?: undefined;
        };
    }>;
}
