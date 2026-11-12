import { PrismaService } from '../../database/prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';
import { CreateChapterDto, CreateTopicDto } from './dto/chapter.dto';
export declare class ChaptersService {
    private readonly prisma;
    private readonly subjectsService;
    constructor(prisma: PrismaService, subjectsService: SubjectsService);
    createChapter(userId: string, dto: CreateChapterDto): Promise<{
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
    completeChapter(userId: string, chapterId: string): Promise<{
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
    createTopic(userId: string, dto: CreateTopicDto): Promise<{
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
