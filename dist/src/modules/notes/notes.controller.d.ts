import { NotesService } from './notes.service';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
export declare class NotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    list(user: AuthenticatedUser, q?: string): Promise<({
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
    create(user: AuthenticatedUser, dto: any): Promise<{
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
    remove(user: AuthenticatedUser, id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
}
