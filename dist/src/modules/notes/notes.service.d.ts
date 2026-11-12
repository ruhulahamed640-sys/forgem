import { PrismaService } from '../../database/prisma/prisma.service';
export declare class NotesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listNotes(userId: string, search?: string): Promise<({
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
        } | null;
        folder: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            colorHex: string;
            parentId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        isArchived: boolean;
        subjectId: string | null;
        tags: string[];
        folderId: string | null;
        content: string;
        isPinned: boolean;
    })[]>;
    createNote(userId: string, dto: {
        title: string;
        content: string;
        subjectId?: string;
        folderId?: string;
        tags?: string[];
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        isArchived: boolean;
        subjectId: string | null;
        tags: string[];
        folderId: string | null;
        content: string;
        isPinned: boolean;
    }>;
    deleteNote(userId: string, noteId: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
}
