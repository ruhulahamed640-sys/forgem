import { ExaminationsService } from './examinations.service';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { CreateExamDto, RecordExamResultsDto } from './dto/examination.dto';
export declare class ExaminationsController {
    private readonly examinationsService;
    constructor(examinationsService: ExaminationsService);
    list(user: AuthenticatedUser): Promise<({
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
    listUpcoming(user: AuthenticatedUser): Promise<({
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
    create(user: AuthenticatedUser, dto: CreateExamDto): Promise<({
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
    getOne(user: AuthenticatedUser, id: string): Promise<{
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
    update(user: AuthenticatedUser, id: string, dto: Partial<CreateExamDto>): Promise<{
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
    remove(user: AuthenticatedUser, id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    recordResults(user: AuthenticatedUser, id: string, dto: RecordExamResultsDto): Promise<({
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
