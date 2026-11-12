import { SpacedRepetitionAlgorithm } from '@prisma/client';
export declare class UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    bio?: string;
    timezone?: string;
}
export declare class UpdateSettingsDto {
    dailyStudyTargetMinutes?: number;
    weeklyStudyTargetMinutes?: number;
    pomodoroWorkMinutes?: number;
    pomodoroBreakMinutes?: number;
    spacedRepetitionAlgorithm?: SpacedRepetitionAlgorithm;
    leaderboardOptIn?: boolean;
    extensionSyncEnabled?: boolean;
}
