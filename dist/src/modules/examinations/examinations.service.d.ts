import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateExamDto, RecordExamResultsDto } from './dto/examination.dto';
export declare class ExaminationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    calculateGradeFromPercentage(pct: number): string;
    listExams(userId: string): Promise<({
        examSubjects: ({
            subject: {
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
            };
            schedules: {
                id: string;
                notes: string | null;
                examDate: Date;
                examId: string;
                durationMinutes: number;
                roomOrVenue: string | null;
                examSubjectId: string;
            }[];
        } & {
            id: string;
            subjectId: string;
            maxMarks: import("@prisma/client/runtime/library").Decimal;
            passingMarks: import("@prisma/client/runtime/library").Decimal;
            preparationProgress: import("@prisma/client/runtime/library").Decimal;
            examId: string;
            syllabusChapters: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        results: ({
            marks: {
                id: string;
                maxMarks: import("@prisma/client/runtime/library").Decimal;
                marksObtained: import("@prisma/client/runtime/library").Decimal;
                remarks: string | null;
                percentage: import("@prisma/client/runtime/library").Decimal;
                examSubjectId: string;
                examResultId: string;
                grade: string;
            }[];
        } & {
            id: string;
            userId: string;
            remarks: string | null;
            examId: string;
            totalMarksObtained: import("@prisma/client/runtime/library").Decimal;
            totalMaxMarks: import("@prisma/client/runtime/library").Decimal;
            percentage: import("@prisma/client/runtime/library").Decimal;
            overallGrade: string;
            rank: number | null;
            publishedAt: Date;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        title: string;
        status: import(".prisma/client").$Enums.ExamStatus;
        userId: string;
        examType: string;
        preparationProgress: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    listUpcomingExams(userId: string): Promise<({
        examSubjects: ({
            subject: {
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
            };
            schedules: {
                id: string;
                notes: string | null;
                examDate: Date;
                examId: string;
                durationMinutes: number;
                roomOrVenue: string | null;
                examSubjectId: string;
            }[];
        } & {
            id: string;
            subjectId: string;
            maxMarks: import("@prisma/client/runtime/library").Decimal;
            passingMarks: import("@prisma/client/runtime/library").Decimal;
            preparationProgress: import("@prisma/client/runtime/library").Decimal;
            examId: string;
            syllabusChapters: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        title: string;
        status: import(".prisma/client").$Enums.ExamStatus;
        userId: string;
        examType: string;
        preparationProgress: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    createExam(userId: string, dto: CreateExamDto): Promise<({
        examSubjects: ({
            schedules: {
                id: string;
                notes: string | null;
                examDate: Date;
                examId: string;
                durationMinutes: number;
                roomOrVenue: string | null;
                examSubjectId: string;
            }[];
        } & {
            id: string;
            subjectId: string;
            maxMarks: import("@prisma/client/runtime/library").Decimal;
            passingMarks: import("@prisma/client/runtime/library").Decimal;
            preparationProgress: import("@prisma/client/runtime/library").Decimal;
            examId: string;
            syllabusChapters: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        title: string;
        status: import(".prisma/client").$Enums.ExamStatus;
        userId: string;
        examType: string;
        preparationProgress: import("@prisma/client/runtime/library").Decimal;
    }) | null>;
    getExamById(userId: string, examId: string): Promise<{
        examSubjects: ({
            subject: {
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
            };
            schedules: {
                id: string;
                notes: string | null;
                examDate: Date;
                examId: string;
                durationMinutes: number;
                roomOrVenue: string | null;
                examSubjectId: string;
            }[];
        } & {
            id: string;
            subjectId: string;
            maxMarks: import("@prisma/client/runtime/library").Decimal;
            passingMarks: import("@prisma/client/runtime/library").Decimal;
            preparationProgress: import("@prisma/client/runtime/library").Decimal;
            examId: string;
            syllabusChapters: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        results: ({
            marks: {
                id: string;
                maxMarks: import("@prisma/client/runtime/library").Decimal;
                marksObtained: import("@prisma/client/runtime/library").Decimal;
                remarks: string | null;
                percentage: import("@prisma/client/runtime/library").Decimal;
                examSubjectId: string;
                examResultId: string;
                grade: string;
            }[];
        } & {
            id: string;
            userId: string;
            remarks: string | null;
            examId: string;
            totalMarksObtained: import("@prisma/client/runtime/library").Decimal;
            totalMaxMarks: import("@prisma/client/runtime/library").Decimal;
            percentage: import("@prisma/client/runtime/library").Decimal;
            overallGrade: string;
            rank: number | null;
            publishedAt: Date;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        title: string;
        status: import(".prisma/client").$Enums.ExamStatus;
        userId: string;
        examType: string;
        preparationProgress: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateExam(userId: string, examId: string, dto: Partial<CreateExamDto>): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        title: string;
        status: import(".prisma/client").$Enums.ExamStatus;
        userId: string;
        examType: string;
        preparationProgress: import("@prisma/client/runtime/library").Decimal;
    }>;
    deleteExam(userId: string, examId: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    recordResults(userId: string, examId: string, dto: RecordExamResultsDto): Promise<({
        marks: {
            id: string;
            maxMarks: import("@prisma/client/runtime/library").Decimal;
            marksObtained: import("@prisma/client/runtime/library").Decimal;
            remarks: string | null;
            percentage: import("@prisma/client/runtime/library").Decimal;
            examSubjectId: string;
            examResultId: string;
            grade: string;
        }[];
    } & {
        id: string;
        userId: string;
        remarks: string | null;
        examId: string;
        totalMarksObtained: import("@prisma/client/runtime/library").Decimal;
        totalMaxMarks: import("@prisma/client/runtime/library").Decimal;
        percentage: import("@prisma/client/runtime/library").Decimal;
        overallGrade: string;
        rank: number | null;
        publishedAt: Date;
    }) | null>;
}
