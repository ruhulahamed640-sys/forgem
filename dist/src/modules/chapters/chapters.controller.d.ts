import { ChaptersService } from './chapters.service';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { CreateChapterDto, CreateTopicDto } from './dto/chapter.dto';
export declare class ChaptersController {
    private readonly chaptersService;
    constructor(chaptersService: ChaptersService);
    createChapter(user: AuthenticatedUser, dto: CreateChapterDto): Promise<{
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
    }>;
    completeChapter(user: AuthenticatedUser, id: string): Promise<{
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
    }>;
    createTopic(user: AuthenticatedUser, dto: CreateTopicDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        orderIndex: number;
        estimatedMinutes: number;
        chapterId: string;
        contentSummary: string | null;
        difficultyLevel: number;
    }>;
}
