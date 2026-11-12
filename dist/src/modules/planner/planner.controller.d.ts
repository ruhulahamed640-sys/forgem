import { PlannerService } from './planner.service';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { CreateStudyPlanDto } from './dto/planner.dto';
export declare class PlannerController {
    private readonly plannerService;
    constructor(plannerService: PlannerService);
    list(user: AuthenticatedUser): Promise<({
        tasks: ({
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
            } | null;
        } & {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            status: import(".prisma/client").$Enums.TaskStatus;
            subjectId: string | null;
            completedAt: Date | null;
            priority: import(".prisma/client").$Enums.PriorityLevel;
            durationMinutes: number;
            scheduledDate: Date;
            rescheduledFromDate: Date | null;
            studyPlanId: string;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        title: string;
        userId: string;
        completionPercentage: import("@prisma/client/runtime/library").Decimal;
        periodType: import(".prisma/client").$Enums.PlanPeriodType;
        targetMinutes: number;
        completedMinutes: number;
        isAiGenerated: boolean;
    })[]>;
    create(user: AuthenticatedUser, dto: CreateStudyPlanDto): Promise<{
        tasks: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            status: import(".prisma/client").$Enums.TaskStatus;
            subjectId: string | null;
            completedAt: Date | null;
            priority: import(".prisma/client").$Enums.PriorityLevel;
            durationMinutes: number;
            scheduledDate: Date;
            rescheduledFromDate: Date | null;
            studyPlanId: string;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        title: string;
        userId: string;
        completionPercentage: import("@prisma/client/runtime/library").Decimal;
        periodType: import(".prisma/client").$Enums.PlanPeriodType;
        targetMinutes: number;
        completedMinutes: number;
        isAiGenerated: boolean;
    }>;
    update(user: AuthenticatedUser, id: string, dto: Partial<CreateStudyPlanDto>): Promise<{
        tasks: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            status: import(".prisma/client").$Enums.TaskStatus;
            subjectId: string | null;
            completedAt: Date | null;
            priority: import(".prisma/client").$Enums.PriorityLevel;
            durationMinutes: number;
            scheduledDate: Date;
            rescheduledFromDate: Date | null;
            studyPlanId: string;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        title: string;
        userId: string;
        completionPercentage: import("@prisma/client/runtime/library").Decimal;
        periodType: import(".prisma/client").$Enums.PlanPeriodType;
        targetMinutes: number;
        completedMinutes: number;
        isAiGenerated: boolean;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    complete(user: AuthenticatedUser, id: string): Promise<{
        completedTaskId: string;
        plan: {
            tasks: {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                status: import(".prisma/client").$Enums.TaskStatus;
                subjectId: string | null;
                completedAt: Date | null;
                priority: import(".prisma/client").$Enums.PriorityLevel;
                durationMinutes: number;
                scheduledDate: Date;
                rescheduledFromDate: Date | null;
                studyPlanId: string;
            }[];
        } & {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            title: string;
            userId: string;
            completionPercentage: import("@prisma/client/runtime/library").Decimal;
            periodType: import(".prisma/client").$Enums.PlanPeriodType;
            targetMinutes: number;
            completedMinutes: number;
            isAiGenerated: boolean;
        };
    } | {
        plan: {
            tasks: {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                status: import(".prisma/client").$Enums.TaskStatus;
                subjectId: string | null;
                completedAt: Date | null;
                priority: import(".prisma/client").$Enums.PriorityLevel;
                durationMinutes: number;
                scheduledDate: Date;
                rescheduledFromDate: Date | null;
                studyPlanId: string;
            }[];
        } & {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            title: string;
            userId: string;
            completionPercentage: import("@prisma/client/runtime/library").Decimal;
            periodType: import(".prisma/client").$Enums.PlanPeriodType;
            targetMinutes: number;
            completedMinutes: number;
            isAiGenerated: boolean;
        };
        completedTaskId?: undefined;
    }>;
}
