import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';
export declare class SubjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listSubjects(userId: string): Promise<({
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
    createSubject(userId: string, dto: CreateSubjectDto): Promise<{
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
    getSubjectById(userId: string, subjectId: string): Promise<{
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
    updateSubject(userId: string, subjectId: string, dto: UpdateSubjectDto): Promise<{
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
    deleteSubject(userId: string, subjectId: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    recalculateSubjectProgress(userId: string, subjectId: string): Promise<{
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
    }>;
}
