import { PrismaService } from '../database/prisma/prisma.service';
export declare class HealthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    checkHealth(): Promise<{
        status: string;
        timestamp: string;
        version: string;
        services: {
            database: string;
            api: string;
        };
    }>;
}
