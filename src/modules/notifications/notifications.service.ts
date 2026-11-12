import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateNotificationPreferenceDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    const notif = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notif) {
      throw new NotFoundException({
        message: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND',
      });
    }
    if (notif.userId !== userId) {
      throw new ForbiddenException({
        message: 'Access denied: you do not own this notification',
        code: 'NOTIFICATION_OWNERSHIP_VIOLATION',
      });
    }
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    const res = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { markedReadCount: res.count };
  }

  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.findMany({
      where: { userId },
    });
  }

  async updatePreferences(userId: string, dto: UpdateNotificationPreferenceDto) {
    return this.prisma.notificationPreference.upsert({
      where: {
        userId_category: { userId, category: dto.category },
      },
      update: {
        inAppEnabled: dto.inAppEnabled,
        emailEnabled: dto.emailEnabled,
        pushEnabled: dto.pushEnabled,
      },
      create: {
        userId,
        category: dto.category,
        inAppEnabled: dto.inAppEnabled ?? true,
        emailEnabled: dto.emailEnabled ?? true,
        pushEnabled: dto.pushEnabled ?? false,
      },
    });
  }
}
