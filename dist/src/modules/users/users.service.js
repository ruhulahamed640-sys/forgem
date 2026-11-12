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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: { include: { institution: true, academicYear: true, academicClass: true } },
                userPoints: true,
                userRoles: { include: { role: true } },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException({ message: 'User not found', code: 'USER_NOT_FOUND' });
        }
        return {
            id: user.id,
            email: user.email,
            status: user.status,
            emailVerifiedAt: user.emailVerifiedAt,
            profile: user.profile,
            points: user.userPoints,
            roles: user.userRoles.map((r) => r.role.name),
        };
    }
    async updateMyProfile(userId, dto) {
        return this.prisma.userProfile.update({
            where: { userId },
            data: dto,
        });
    }
    async softDeleteMyAccount(userId) {
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: { status: 'DELETED', deletedAt: new Date() },
            }),
            this.prisma.userSession.updateMany({
                where: { userId },
                data: { isRevoked: true, revokedAt: new Date() },
            }),
            this.prisma.refreshToken.updateMany({
                where: { userId },
                data: { isRevoked: true, revokedAt: new Date() },
            }),
        ]);
        return { accountDeleted: true };
    }
    async getMySettings(userId) {
        return this.prisma.userSetting.findUnique({ where: { userId } });
    }
    async updateMySettings(userId, dto) {
        return this.prisma.userSetting.upsert({
            where: { userId },
            update: dto,
            create: { userId, ...dto },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map