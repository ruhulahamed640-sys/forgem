import { PriorityLevel, AssignmentStatus } from '@prisma/client';
export declare class CreateAssignmentDto {
    subjectId: string;
    title: string;
    description?: string;
    deadline: string;
    priority?: PriorityLevel;
}
export declare class UpdateAssignmentDto {
    title?: string;
    description?: string;
    deadline?: string;
    priority?: PriorityLevel;
    status?: AssignmentStatus;
    completionPercentage?: number;
}
