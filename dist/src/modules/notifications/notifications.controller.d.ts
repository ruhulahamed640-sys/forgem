import { NotificationsService } from './notifications.service';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { UpdateNotificationPreferenceDto } from './dto/notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(user: AuthenticatedUser): Promise<{
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
    markRead(user: AuthenticatedUser, id: string): Promise<{
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
    markAllRead(user: AuthenticatedUser): Promise<{
        markedReadCount: number;
    }>;
    getPreferences(user: AuthenticatedUser): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        category: import(".prisma/client").$Enums.NotificationCategory;
        inAppEnabled: boolean;
        emailEnabled: boolean;
        pushEnabled: boolean;
    }[]>;
    updatePreferences(user: AuthenticatedUser, dto: UpdateNotificationPreferenceDto): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        category: import(".prisma/client").$Enums.NotificationCategory;
        inAppEnabled: boolean;
        emailEnabled: boolean;
        pushEnabled: boolean;
    }>;
}
