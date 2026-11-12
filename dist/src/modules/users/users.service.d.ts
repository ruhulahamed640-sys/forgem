import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateProfileDto, UpdateSettingsDto } from './dto/user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMyProfile(userId: string): Promise<{
        id: string;
        email: string;
        status: import(".prisma/client").$Enums.AccountStatus;
        emailVerifiedAt: Date | null;
        profile: ({
            academicYear: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date;
                endDate: Date;
                isCurrent: boolean;
            } | null;
            institution: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                type: string;
                country: string | null;
            } | null;
            academicClass: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                institutionId: string | null;
                gradeLevel: string;
                section: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            displayName: string | null;
            avatarStorageKey: string | null;
            bio: string | null;
            dateOfBirth: Date | null;
            phone: string | null;
            timezone: string;
            locale: string;
            institutionId: string | null;
            classId: string | null;
            academicYearId: string | null;
            userId: string;
        }) | null;
        points: {
            id: string;
            updatedAt: Date;
            totalPointsEarned: number;
            currentBalance: number;
            totalPointsSpent: number;
            currentStreakDays: number;
            longestStreakDays: number;
            userId: string;
        } | null;
        roles: import(".prisma/client").$Enums.RoleName[];
    }>;
    updateMyProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        displayName: string | null;
        avatarStorageKey: string | null;
        bio: string | null;
        dateOfBirth: Date | null;
        phone: string | null;
        timezone: string;
        locale: string;
        institutionId: string | null;
        classId: string | null;
        academicYearId: string | null;
        userId: string;
    }>;
    softDeleteMyAccount(userId: string): Promise<{
        accountDeleted: boolean;
    }>;
    getMySettings(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dailyStudyTargetMinutes: number;
        weeklyStudyTargetMinutes: number;
        pomodoroWorkMinutes: number;
        pomodoroBreakMinutes: number;
        spacedRepetitionAlgorithm: import(".prisma/client").$Enums.SpacedRepetitionAlgorithm;
        customRevisionIntervals: import("@prisma/client/runtime/library").JsonValue | null;
        leaderboardOptIn: boolean;
        extensionSyncEnabled: boolean;
        aiAssistanceEnabled: boolean;
        userId: string;
    } | null>;
    updateMySettings(userId: string, dto: UpdateSettingsDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dailyStudyTargetMinutes: number;
        weeklyStudyTargetMinutes: number;
        pomodoroWorkMinutes: number;
        pomodoroBreakMinutes: number;
        spacedRepetitionAlgorithm: import(".prisma/client").$Enums.SpacedRepetitionAlgorithm;
        customRevisionIntervals: import("@prisma/client/runtime/library").JsonValue | null;
        leaderboardOptIn: boolean;
        extensionSyncEnabled: boolean;
        aiAssistanceEnabled: boolean;
        userId: string;
    }>;
}
