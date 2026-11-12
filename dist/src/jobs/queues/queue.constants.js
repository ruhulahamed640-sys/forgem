"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_JOB_OPTIONS = exports.STUDYPILOT_QUEUES = void 0;
exports.STUDYPILOT_QUEUES = {
    EMAIL_DELIVERY: 'sp-email-delivery-queue',
    ASSIGNMENT_REMINDERS: 'sp-assignment-reminders-queue',
    EXAM_REMINDERS: 'sp-exam-reminders-queue',
    REVISION_REMINDERS: 'sp-revision-reminders-queue',
    DAILY_LEADERBOARD: 'sp-daily-leaderboard-queue',
    WEEKLY_LEADERBOARD: 'sp-weekly-leaderboard-queue',
    MONTHLY_LEADERBOARD: 'sp-monthly-leaderboard-queue',
    ACHIEVEMENT_EVALUATION: 'sp-achievement-evaluation-queue',
    AI_GENERATION: 'sp-ai-generation-queue',
    SUBSCRIPTION_EXPIRY: 'sp-subscription-expiry-queue',
    CLEANUP_TASKS: 'sp-cleanup-tasks-queue',
};
exports.DEFAULT_JOB_OPTIONS = {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000,
    },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 1000 },
};
//# sourceMappingURL=queue.constants.js.map