import { AnalyticsService } from './analytics.service';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getOverview(user: AuthenticatedUser): Promise<{
        totalStudyMinutes: number;
        weeklyStudyMinutes: number;
        totalSessionsCompleted: number;
        assignmentCompletionRate: number;
        upcomingDeadlines: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            userId: string;
            subjectId: string;
            completedAt: Date | null;
            deadline: Date;
            priority: import(".prisma/client").$Enums.PriorityLevel;
            completionPercentage: number;
            submittedAt: Date | null;
            teacherFeedback: string | null;
            isOverdue: boolean;
        }[];
        upcomingExams: {
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
        }[];
        gamification: {
            currentBalance: number;
            totalPointsEarned: number;
            currentStreakDays: number;
        };
    }>;
    getStudyTime(user: AuthenticatedUser): Promise<{
        totalMinutesLast30Days: number;
        dailyBreakdown: {
            date: string;
            studyMinutes: number;
            breakMinutes: number;
            sessionsCompleted: number;
        }[];
    }>;
    getSubjectProgress(user: AuthenticatedUser): Promise<({
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
    } & {
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
    })[]>;
    getAssignmentPerformance(user: AuthenticatedUser): Promise<{
        totalAssignments: number;
        completedAssignments: number;
        overdueAssignments: number;
        onTimeCompletionRate: number;
        completionRate: number;
    }>;
    getExamPerformance(user: AuthenticatedUser): Promise<{
        examsEvaluated: number;
        averagePercentage: number;
        history: ({
            exam: {
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
            };
            marks: ({
                examSubject: {
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
                } & {
                    id: string;
                    subjectId: string;
                    maxMarks: import("@prisma/client/runtime/library").Decimal;
                    passingMarks: import("@prisma/client/runtime/library").Decimal;
                    preparationProgress: import("@prisma/client/runtime/library").Decimal;
                    examId: string;
                    syllabusChapters: import("@prisma/client/runtime/library").JsonValue | null;
                };
            } & {
                id: string;
                maxMarks: import("@prisma/client/runtime/library").Decimal;
                marksObtained: import("@prisma/client/runtime/library").Decimal;
                remarks: string | null;
                percentage: import("@prisma/client/runtime/library").Decimal;
                examSubjectId: string;
                examResultId: string;
                grade: string;
            })[];
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
    }>;
    getWeeklyReport(user: AuthenticatedUser): Promise<{
        generatedAt: string;
        weeklyStudyMinutes: number;
        revisionsCompletedThisWeek: number;
        goalsAchievedTotal: number;
        assignmentPerformance: {
            totalAssignments: number;
            completedAssignments: number;
            overdueAssignments: number;
            onTimeCompletionRate: number;
            completionRate: number;
        };
        examPerformance: {
            examsEvaluated: number;
            averagePercentage: number;
            history: ({
                exam: {
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
                };
                marks: ({
                    examSubject: {
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
                    } & {
                        id: string;
                        subjectId: string;
                        maxMarks: import("@prisma/client/runtime/library").Decimal;
                        passingMarks: import("@prisma/client/runtime/library").Decimal;
                        preparationProgress: import("@prisma/client/runtime/library").Decimal;
                        examId: string;
                        syllabusChapters: import("@prisma/client/runtime/library").JsonValue | null;
                    };
                } & {
                    id: string;
                    maxMarks: import("@prisma/client/runtime/library").Decimal;
                    marksObtained: import("@prisma/client/runtime/library").Decimal;
                    remarks: string | null;
                    percentage: import("@prisma/client/runtime/library").Decimal;
                    examSubjectId: string;
                    examResultId: string;
                    grade: string;
                })[];
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
        };
    }>;
}
