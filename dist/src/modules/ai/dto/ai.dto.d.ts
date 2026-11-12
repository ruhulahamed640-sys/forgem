export declare class AiChatDto {
    conversationId?: string;
    subjectId?: string;
    prompt: string;
}
export declare class GenerateAiStudyPlanDto {
    startDate: string;
    endDate: string;
    dailyAvailableMinutes: number;
    subjectIds?: string[];
    goalFocus: string;
}
export declare class AiSummarizeDto {
    content: string;
}
export declare class AiExplainTopicDto {
    topicTitle: string;
    academicLevel?: string;
}
