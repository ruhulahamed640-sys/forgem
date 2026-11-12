import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateNotificationPreferenceDto } from './dto/notification.dto';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listNotifications(userId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        body: string;
        category: import(".prisma/client").$Enums.NotificationCategory;
        actionUrl: string | null;
        isRead: boolean;
        readAt: Date | null;
    }[]>;
    markAsRead(userId: string, notificationId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        body: string;
        category: import(".prisma/client").$Enums.NotificationCategory;
        actionUrl: string | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    markAllAsRead(userId: string): Promise<{
        markedReadCount: number;
    }>;
    getPreferences(userId: string): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        category: import(".prisma/client").$Enums.NotificationCategory;
        inAppEnabled: boolean;
        emailEnabled: boolean;
        pushEnabled: boolean;
    }[]>;
    updatePreferences(userId: string, dto: UpdateNotificationPreferenceDto): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        category: import(".prisma/client").$Enums.NotificationCategory;
        inAppEnabled: boolean;
        emailEnabled: boolean;
        pushEnabled: boolean;
    }>;
}
