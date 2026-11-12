import { Injectable } from '@nestjs/common';
import { LeaderboardPeriod } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Computes deterministic UTC period boundaries for DAILY, WEEKLY (ISO Monday),
   * MONTHLY, and ALL_TIME leaderboards from verified EARNED point transactions.
   */
  public getPeriodBoundaries(period: LeaderboardPeriod, referenceDate = new Date()) {
    const now = new Date(referenceDate);
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(start);

    if (period === 'DAILY') {
      end.setUTCDate(start.getUTCDate() + 1);
    } else if (period === 'WEEKLY') {
      const day = start.getUTCDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      start.setUTCDate(start.getUTCDate() + diffToMonday);
      end.setTime(start.getTime());
      end.setUTCDate(start.getUTCDate() + 7);
    } else if (period === 'MONTHLY') {
      start.setUTCDate(1);
      end.setTime(start.getTime());
      end.setUTCMonth(start.getUTCMonth() + 1);
    } else {
      start.setTime(new Date('2020-01-01T00:00:00.000Z').getTime());
      end.setUTCFullYear(now.getUTCFullYear() + 10);
    }
    return { periodStart: start, periodEnd: end };
  }

  async getLeaderboard(period: LeaderboardPeriod, limit = 50) {
    const { periodStart, periodEnd } = this.getPeriodBoundaries(period);

    const grouped = await this.prisma.pointTransaction.groupBy({
      by: ['userId'],
      where: {
        transactionType: 'EARNED',
        pointsDelta: { gt: 0 },
        createdAt: { gte: periodStart, lt: periodEnd },
      },
      _sum: { pointsDelta: true },
      orderBy: { _sum: { pointsDelta: 'desc' } },
      take: limit,
    });

    const userIds = grouped.map((g) => g.userId);
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        status: 'ACTIVE',
      },
      include: { profile: true, settings: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const rankings = [];
    let currentRank = 1;
    for (const row of grouped) {
      const u = userMap.get(row.userId);
      if (!u || u.settings?.leaderboardOptIn === false) continue;
      rankings.push({
        rank: currentRank++,
        userId: u.id,
        displayName:
          u.profile?.displayName ||
          `${u.profile?.firstName || 'Student'} ${u.profile?.lastName?.charAt(0) || ''}.`,
        points: row._sum.pointsDelta || 0,
      });
    }

    return {
      period,
      timezone: 'UTC',
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      rankings,
    };
  }

  async getMyStanding(userId: string) {
    const [daily, weekly, monthly, allTime, summary] = await Promise.all([
      this.getLeaderboard('DAILY', 500),
      this.getLeaderboard('WEEKLY', 500),
      this.getLeaderboard('MONTHLY', 500),
      this.getLeaderboard('ALL_TIME', 500),
      this.prisma.userPoint.findUnique({ where: { userId } }),
    ]);

    const findMyRank = (list: Array<{ userId: string; rank: number; points: number }>) => {
      const entry = list.find((r) => r.userId === userId);
      return entry ? { rank: entry.rank, points: entry.points } : { rank: null, points: 0 };
    };

    return {
      userId,
      balance: summary?.currentBalance || 0,
      totalPointsEarned: summary?.totalPointsEarned || 0,
      standings: {
        daily: findMyRank(daily.rankings),
        weekly: findMyRank(weekly.rankings),
        monthly: findMyRank(monthly.rankings),
        allTime: findMyRank(allTime.rankings),
      },
    };
  }
}
