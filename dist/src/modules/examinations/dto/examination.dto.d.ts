export declare class ExamSubjectInputDto {
    subjectId: string;
    maxMarks: number;
    passingMarks: number;
    examDate?: string;
}
export declare class CreateExamDto {
    title: string;
    examType?: string;
    description?: string;
    startDate: string;
    endDate: string;
    subjects?: ExamSubjectInputDto[];
}
export declare class SubjectMarkEntryDto {
    subjectId: string;
    marksObtained: number;
    maxMarks: number;
}
export declare class RecordExamResultsDto {
    marks: SubjectMarkEntryDto[];
    remarks?: string;
}
