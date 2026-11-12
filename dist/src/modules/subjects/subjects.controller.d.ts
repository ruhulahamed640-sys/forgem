import { SubjectsService } from './subjects.service';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';
export declare class SubjectsController {
    private readonly subjectsService;
    constructor(subjectsService: SubjectsService);
    list(user: AuthenticatedUser): Promise<({
        subjectProgress: {
            id: string;
            updatedAt: Date;
            userId: string;
            subjectId: string;
            completionPercentage: import("@prisma/client/runtime/library").Decimal;
            totalChapters: number;
            completedChapters: number;
            totalTopics: number;
            completedTopics: number;
            totalStudyMinutes: number;
            lastStudiedAt: Date | null;
        }[];
        chapters: ({
            topics: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                orderIndex: number;
                estimatedMinutes: number;
                chapterId: string;
                contentSummary: string | null;
                difficultyLevel: number;
            }[];
        } & {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            subjectId: string;
            orderIndex: number;
            estimatedMinutes: number;
            isCompleted: boolean;
            completedAt: Date | null;
        })[];
    } & {
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
    })[]>;
    create(user: AuthenticatedUser, dto: CreateSubjectDto): Promise<{
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
    }>;
    getOne(user: AuthenticatedUser, id: string): Promise<{
        subjectProgress: {
            id: string;
            updatedAt: Date;
            userId: string;
            subjectId: string;
            completionPercentage: import("@prisma/client/runtime/library").Decimal;
            totalChapters: number;
            completedChapters: number;
            totalTopics: number;
            completedTopics: number;
            totalStudyMinutes: number;
            lastStudiedAt: Date | null;
        }[];
        chapters: ({
            topics: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                orderIndex: number;
                estimatedMinutes: number;
                chapterId: string;
                contentSummary: string | null;
                difficultyLevel: number;
            }[];
        } & {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            subjectId: string;
            orderIndex: number;
            estimatedMinutes: number;
            isCompleted: boolean;
            completedAt: Date | null;
        })[];
    } & {
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
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateSubjectDto): Promise<{
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
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
}
