import { NotificationCategory } from '@prisma/client';
export declare class UpdateNotificationPreferenceDto {
    category: NotificationCategory;
    inAppEnabled?: boolean;
    emailEnabled?: boolean;
    pushEnabled?: boolean;
}
