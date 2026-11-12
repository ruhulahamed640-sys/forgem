import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400 * 1000);

    const [
      totalStats,
      weeklyStats,
      assignmentsTotal,
      assignmentsCompleted,
      upcomingAssignments,
      upcomingExams,
      points,
    ] = await Promise.all([
      this.prisma.studyStatistic.aggregate({
        where: { userId },
        _sum: { totalStudySeconds: true, sessionsCompleted: true, tasksCompleted: true },
      }),
      this.prisma.studyStatistic.aggregate({
        where: { userId, statDate: { gte: sevenDaysAgo } },
        _sum: { totalStudySeconds: true, sessionsCompleted: true },
      }),
      this.prisma.assignment.count({ where: { userId } }),
      this.prisma.assignment.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.assignment.findMany({
        where: { userId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
        orderBy: { deadline: 'asc' },
        take: 5,
      }),
      this.prisma.exam.findMany({
        where: { userId, status: 'UPCOMING' },
        orderBy: { startDate: 'asc' },
        take: 5,
      }),
      this.prisma.userPoint.findUnique({ where: { userId } }),
    ]);

    return {
      totalStudyMinutes: Math.floor((totalStats._sum.totalStudySeconds || 0) / 60),
      weeklyStudyMinutes: Math.floor((weeklyStats._sum.totalStudySeconds || 0) / 60),
      totalSessionsCompleted: totalStats._sum.sessionsCompleted || 0,
      assignmentCompletionRate:
        assignmentsTotal > 0
          ? Math.round((assignmentsCompleted / assignmentsTotal) * 10000) / 100
          : 0,
      upcomingDeadlines: upcomingAssignments,
      upcomingExams,
      gamification: {
        currentBalance: points?.currentBalance || 0,
        totalPointsEarned: points?.totalPointsEarned || 0,
        currentStreakDays: points?.currentStreakDays || 0,
      },
    };
  }

  async getStudyTimeAnalytics(userId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400 * 1000);
    const stats = await this.prisma.studyStatistic.findMany({
      where: { userId, statDate: { gte: thirtyDaysAgo } },
      orderBy: { statDate: 'asc' },
    });
    const totalMinutes = stats.reduce(
      (acc, s) => acc + Math.floor(s.totalStudySeconds / 60),
      0,
    );
    return {
      totalMinutesLast30Days: totalMinutes,
      dailyBreakdown: stats.map((s) => ({
        date: s.statDate.toISOString().slice(0, 10),
        studyMinutes: Math.floor(s.totalStudySeconds / 60),
        breakMinutes: Math.floor(s.totalBreakSeconds / 60),
        sessionsCompleted: s.sessionsCompleted,
      })),
    };
  }

  async getSubjectProgressAnalytics(userId: string) {
    return this.prisma.studentSubjectProgress.findMany({
      where: { userId },
      include: { subject: true },
    });
  }

  async getAssignmentPerformance(userId: string) {
    const all = await this.prisma.assignment.findMany({ where: { userId } });
    const total = all.length;
    const completed = all.filter((a) => a.status === 'COMPLETED' || a.status === 'GRADED').length;
    const overdue = all.filter((a) => a.isOverdue).length;
    const onTime = all.filter(
      (a) =>
        (a.status === 'COMPLETED' || a.status === 'GRADED') &&
        a.completedAt &&
        a.completedAt <= a.deadline,
    ).length;

    return {
      totalAssignments: total,
      completedAssignments: completed,
      overdueAssignments: overdue,
      onTimeCompletionRate:
        completed > 0 ? Math.round((onTime / completed) * 10000) / 100 : 0,
      completionRate: total > 0 ? Math.round((completed / total) * 10000) / 100 : 0,
    };
  }

  async getExamPerformance(userId: string) {
    const results = await this.prisma.examResult.findMany({
      where: { userId },
      include: { exam: true, marks: { include: { examSubject: { include: { subject: true } } } } },
      orderBy: { publishedAt: 'asc' },
    });
    const averagePercentage =
      results.length > 0
        ? Math.round(
            (results.reduce((acc, r) => acc + Number(r.percentage), 0) / results.length) * 100,
          ) / 100
        : 0;
    return {
      examsEvaluated: results.length,
      averagePercentage,
      history: results,
    };
  }

  async getWeeklyReport(userId: string) {
    const [overview, assignmentPerf, examPerf, revisionsCount, goalsAchieved] =
      await Promise.all([
        this.getOverview(userId),
        this.getAssignmentPerformance(userId),
        this.getExamPerformance(userId),
        this.prisma.revisionSession.count({
          where: {
            userId,
            completedAt: { gte: new Date(Date.now() - 7 * 86400 * 1000) },
          },
        }),
        this.prisma.studyGoal.count({
          where: { userId, isAchieved: true },
        }),
      ]);

    return {
      generatedAt: new Date().toISOString(),
      weeklyStudyMinutes: overview.weeklyStudyMinutes,
      revisionsCompletedThisWeek: revisionsCount,
      goalsAchievedTotal: goalsAchieved,
      assignmentPerformance: assignmentPerf,
      examPerformance: examPerf,
    };
  }
}
