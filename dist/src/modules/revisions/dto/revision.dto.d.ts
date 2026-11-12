import { SpacedRepetitionAlgorithm } from '@prisma/client';
export declare class CreateRevisionDto {
    topicId: string;
    algorithm?: SpacedRepetitionAlgorithm;
    scheduledFor?: string;
}
export declare class CompleteRevisionDto {
    difficultyRating: number;
    durationMinutes: number;
    notes?: string;
}
