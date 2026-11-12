import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateProfileDto, UpdateSettingsDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: { include: { institution: true, academicYear: true, academicClass: true } },
        userPoints: true,
        userRoles: { include: { role: true } },
      },
    });
    if (!user) {
      throw new NotFoundException({ message: 'User not found', code: 'USER_NOT_FOUND' });
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

  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.userProfile.update({
      where: { userId },
      data: dto,
    });
  }

  async softDeleteMyAccount(userId: string) {
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

  async getMySettings(userId: string) {
    return this.prisma.userSetting.findUnique({ where: { userId } });
  }

  async updateMySettings(userId: string, dto: UpdateSettingsDto) {
    return this.prisma.userSetting.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }
}
