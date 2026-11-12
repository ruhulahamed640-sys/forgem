"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listNotifications(userId) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async markAsRead(userId, notificationId) {
        const notif = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notif) {
            throw new common_1.NotFoundException({
                message: 'Notification not found',
                code: 'NOTIFICATION_NOT_FOUND',
            });
        }
        if (notif.userId !== userId) {
            throw new common_1.ForbiddenException({
                message: 'Access denied: you do not own this notification',
                code: 'NOTIFICATION_OWNERSHIP_VIOLATION',
            });
        }
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async markAllAsRead(userId) {
        const res = await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
        return { markedReadCount: res.count };
    }
    async getPreferences(userId) {
        return this.prisma.notificationPreference.findMany({
            where: { userId },
        });
    }
    async updatePreferences(userId, dto) {
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
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map