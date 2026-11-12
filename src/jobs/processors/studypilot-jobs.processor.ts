import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LeaderboardService } from '../../modules/leaderboard/leaderboard.service';

@Injectable()
export class StudyPilotJobsProcessor {
  private readonly logger = new Logger(StudyPilotJobsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  async processAssignmentReminders() {
    const dueReminders = await this.prisma.assignmentReminder.findMany({
      where: { isSent: false, remindAt: { lte: new Date() } },
      include: { assignment: true },
      take: 100,
    });

    for (const rem of dueReminders) {
      await this.prisma.$transaction([
        this.prisma.notification.create({
          data: {
            userId: rem.assignment.userId,
            category: 'ASSIGNMENT_REMINDER',
            title: `Upcoming Deadline: ${rem.assignment.title}`,
            body: `Your assignment "${rem.assignment.title}" is due at ${rem.assignment.deadline.toISOString()}.`,
          },
        }),
        this.prisma.assignmentReminder.update({
          where: { id: rem.id },
          data: { isSent: true, sentAt: new Date() },
        }),
      ]);
    }
    return { processedCount: dueReminders.length };
  }

  async processSubscriptionExpiries() {
    const expired = await this.prisma.subscription.updateMany({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: { lte: new Date() },
      },
      data: { status: 'EXPIRED' },
    });
    return { expiredCount: expired.count };
  }

  async snapshotLeaderboard(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME') {
    const board = await this.leaderboardService.getLeaderboard(period, 100);
    const periodStart = new Date(board.periodStart);
    const periodEnd = new Date(board.periodEnd);

    for (const entry of board.rankings) {
      await this.prisma.leaderboardSnapshot.upsert({
        where: {
          period_periodStart_userId: {
            period,
            periodStart,
            userId: entry.userId,
          },
        },
        update: {
          points: entry.points,
          rank: entry.rank,
          computedAt: new Date(),
        },
        create: {
          period,
          periodStart,
          periodEnd,
          userId: entry.userId,
          points: entry.points,
          rank: entry.rank,
        },
      });
    }
    this.logger.log(`Persisted ${board.rankings.length} ${period} leaderboard snapshots`);
    return { period, count: board.rankings.length };
  }
}
