export declare const STUDYPILOT_QUEUES: {
    readonly EMAIL_DELIVERY: "sp-email-delivery-queue";
    readonly ASSIGNMENT_REMINDERS: "sp-assignment-reminders-queue";
    readonly EXAM_REMINDERS: "sp-exam-reminders-queue";
    readonly REVISION_REMINDERS: "sp-revision-reminders-queue";
    readonly DAILY_LEADERBOARD: "sp-daily-leaderboard-queue";
    readonly WEEKLY_LEADERBOARD: "sp-weekly-leaderboard-queue";
    readonly MONTHLY_LEADERBOARD: "sp-monthly-leaderboard-queue";
    readonly ACHIEVEMENT_EVALUATION: "sp-achievement-evaluation-queue";
    readonly AI_GENERATION: "sp-ai-generation-queue";
    readonly SUBSCRIPTION_EXPIRY: "sp-subscription-expiry-queue";
    readonly CLEANUP_TASKS: "sp-cleanup-tasks-queue";
};
export declare const DEFAULT_JOB_OPTIONS: {
    attempts: number;
    backoff: {
        type: "exponential";
        delay: number;
    };
    removeOnComplete: {
        count: number;
    };
    removeOnFail: {
        count: number;
    };
};
