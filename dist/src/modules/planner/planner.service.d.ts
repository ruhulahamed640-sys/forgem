import { PrismaService } from '../../database/prisma/prisma.service';
import { RewardsService } from '../rewards/rewards.service';
import { CreateStudyPlanDto } from './dto/planner.dto';
export declare class PlannerService {
    private readonly prisma;
    private readonly rewardsService;
    constructor(prisma: PrismaService, rewardsService: RewardsService);
    listPlans(userId: string): Promise<({
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
    createPlan(userId: string, dto: CreateStudyPlanDto, isAiGenerated?: boolean): Promise<{
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
    getPlanOrVerifyOwnership(userId: string, planId: string): Promise<{
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
    updatePlan(userId: string, planId: string, dto: Partial<CreateStudyPlanDto>): Promise<{
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
    deletePlan(userId: string, planId: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    completePlanTask(userId: string, taskOrPlanId: string): Promise<{
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
