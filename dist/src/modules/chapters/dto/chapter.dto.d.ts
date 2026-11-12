export declare class CreateChapterDto {
    subjectId: string;
    title: string;
    orderIndex: number;
    description?: string;
    estimatedMinutes?: number;
}
export declare class CreateTopicDto {
    chapterId: string;
    title: string;
    orderIndex: number;
    difficultyLevel?: number;
    isCompleted?: boolean;
}
