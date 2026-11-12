import { PlanPeriodType, PriorityLevel } from '@prisma/client';
export declare class CreatePlanTaskDto {
    subjectId?: string;
    title: string;
    description?: string;
    scheduledDate: string;
    durationMinutes: number;
    priority?: PriorityLevel;
}
export declare class CreateStudyPlanDto {
    title: string;
    description?: string;
    periodType?: PlanPeriodType;
    startDate: string;
    endDate: string;
    targetMinutes: number;
    tasks?: CreatePlanTaskDto[];
}
