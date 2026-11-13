import { PrismaClient, RoleName, AccountStatus, PriorityLevel, PlanPeriodType, TaskStatus, SpacedRepetitionAlgorithm, StudySessionStatus, ExamStatus, PlanPeriodType as PlanPeriodTypeEnum, SubscriptionStatus, PaymentStatus, NotificationChannel, NotificationCategory, PointTransactionType, LeaderboardPeriod, RedemptionStatus, TicketStatus } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create roles
  const studentRole = await prisma.role.upsert({
    where: { name: RoleName.STUDENT },
    update: {},
    create: {
      name: RoleName.STUDENT,
      description: 'Standard student user',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {},
    create: {
      name: RoleName.ADMIN,
      description: 'Administrator with elevated privileges',
    },
  });

  const superAdminRole = await prisma.role.upsert({
    where: { name: RoleName.SUPER_ADMIN },
    update: {},
    create: {
      name: RoleName.SUPER_ADMIN,
      description: 'Super administrator with full access',
    },
  });

  console.log('✅ Roles created');

  // Create subscription plans
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { code: 'FREE_TIER' },
    update: {},
    create: {
      code: 'FREE_TIER',
      name: 'Free Tier',
      priceCents: 0,
      currency: 'USD',
      billingInterval: 'MONTHLY',
      dailyAiTokenLimit: 25000,
      storageQuotaBytes: 1073741824, // 1GB
      features: {
        aiChat: true,
        studyPlanGeneration: true,
        summarization: true,
        topicExplanation: true,
        revisionScheduling: true,
        plannerBasic: true,
        notesBasic: true,
        analyticsBasic: true,
        rewardsBasic: true,
        leaderboardBasic: true,
      },
      isActive: true,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { code: 'PRO_MONTHLY' },
    update: {},
    create: {
      code: 'PRO_MONTHLY',
      name: 'Pro Monthly',
      priceCents: 999, // $9.99
      currency: 'USD',
      billingInterval: 'MONTHLY',
      dailyAiTokenLimit: 500000,
      storageQuotaBytes: 10737418240, // 10GB
      features: {
        aiChat: true,
        studyPlanGeneration: true,
        summarization: true,
        topicExplanation: true,
        revisionScheduling: true,
        plannerAdvanced: true,
        notesAdvanced: true,
        analyticsAdvanced: true,
        rewardsAdvanced: true,
        leaderboardAdvanced: true,
        prioritySupport: true,
        customIntegrations: true,
      },
      isActive: true,
    },
  });

  console.log('✅ Subscription plans created');

  // Create reward rules
  const rewardRules = [
    {
      eventCode: 'ASSIGNMENT_COMPLETED',
      description: 'Completed an assignment on time',
      pointsAwarded: 50,
      maxDailyOccurrences: 10,
      cooldownSeconds: 60,
      minDurationSeconds: 300,
      isActive: true,
    },
    {
      eventCode: 'ASSIGNMENT_COMPLETED_LATE',
      description: 'Completed an assignment after deadline',
      pointsAwarded: 25,
      maxDailyOccurrences: 10,
      cooldownSeconds: 60,
      minDurationSeconds: 300,
      isActive: true,
    },
    {
      eventCode: 'STUDY_SESSION_COMPLETED',
      description: 'Completed a study session',
      pointsAwarded: 25,
      maxDailyOccurrences: 20,
      cooldownSeconds: 300,
      minDurationSeconds: 900, // 15 minutes minimum
      isActive: true,
    },
    {
      eventCode: 'REVISION_COMPLETED',
      description: 'Completed a spaced-repetition revision',
      pointsAwarded: 30,
      maxDailyOccurrences: 20,
      cooldownSeconds: 60,
      minDurationSeconds: 60,
      isActive: true,
    },
    {
      eventCode: 'STUDY_GOAL_ACHIEVED',
      description: 'Completed a study plan goal',
      pointsAwarded: 100,
      maxDailyOccurrences: 5,
      cooldownSeconds: 3600,
      minDurationSeconds: 0,
      isActive: true,
    },
    {
      eventCode: 'STREAK_MILESTONE_7D',
      description: 'Maintained a 7-day study streak',
      pointsAwarded: 200,
      maxDailyOccurrences: 1,
      cooldownSeconds: 86400,
      minDurationSeconds: 0,
      isActive: true,
    },
  ];

  for (const rule of rewardRules) {
    await prisma.rewardRule.upsert({
      where: { eventCode: rule.eventCode },
      update: rule,
      create: rule,
    });
  }

  console.log('✅ Reward rules created');

  // Create achievements
  const achievements = [
    {
      code: 'FIRST_ASSIGNMENT',
      title: 'First Steps',
      description: 'Complete your first assignment',
      icon: 'trophy',
      criteriaType: 'ASSIGNMENTS_COMPLETED',
      criteriaValue: 1,
      bonusPoints: 50,
      isActive: true,
    },
    {
      code: 'ASSIGNMENT_MASTER_10',
      title: 'Assignment Master',
      description: 'Complete 10 assignments',
      icon: 'medal',
      criteriaType: 'ASSIGNMENTS_COMPLETED',
      criteriaValue: 10,
      bonusPoints: 100,
      isActive: true,
    },
    {
      code: 'STUDY_STREAK_7',
      title: 'Week Warrior',
      description: 'Study 7 days in a row',
      icon: 'fire',
      criteriaType: 'TOTAL_STUDY_MINUTES',
      criteriaValue: 420, // 7 hours
      bonusPoints: 100,
      isActive: true,
    },
    {
      code: 'STUDY_STREAK_30',
      title: 'Month Master',
      description: 'Study 30 days in a row',
      icon: 'calendar',
      criteriaType: 'TOTAL_STUDY_MINUTES',
      criteriaValue: 1800, // 30 hours
      bonusPoints: 500,
      isActive: true,
    },
    {
      code: 'REVISION_CHAMPION_50',
      title: 'Revision Champion',
      description: 'Complete 50 revisions',
      icon: 'brain',
      criteriaType: 'REVISIONS_COMPLETED',
      criteriaValue: 50,
      bonusPoints: 200,
      isActive: true,
    },
    {
      code: 'FIRST_EXAM',
      title: 'Exam Ready',
      description: 'Record results for your first exam',
      icon: 'graduation-cap',
      criteriaType: 'EXAMS_COMPLETED',
      criteriaValue: 1,
      bonusPoints: 50,
      isActive: true,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
  }

  console.log('✅ Achievements created');

  // Create reward catalog items
  const rewards = [
    {
      name: 'StudyPilot Sticker Pack',
      description: 'Digital sticker pack for your notes and planner',
      pointsCost: 100,
      stockQuantity: 1000,
      category: 'DIGITAL_PERK',
      isActive: true,
    },
    {
      name: 'Custom Theme - Dark Forest',
      description: 'Unlock the exclusive Dark Forest theme',
      pointsCost: 500,
      stockQuantity: 500,
      category: 'COSMETIC',
      isActive: true,
    },
    {
      name: 'Custom Theme - Ocean Breeze',
      description: 'Unlock the exclusive Ocean Breeze theme',
      pointsCost: 500,
      stockQuantity: 500,
      category: 'COSMETIC',
      isActive: true,
    },
    {
      name: '1 Week Pro Trial',
      description: 'Unlock Pro features for 7 days',
      pointsCost: 1000,
      stockQuantity: 200,
      category: 'SUBSCRIPTION',
      isActive: true,
    },
    {
      name: '1 Month Pro Subscription',
      description: 'Full Pro access for 30 days',
      pointsCost: 3000,
      stockQuantity: 100,
      category: 'SUBSCRIPTION',
      isActive: true,
    },
    {
      name: 'StudyPilot Merchandise - T-Shirt',
      description: 'Official StudyPilot branded t-shirt (shipping not included)',
      pointsCost: 5000,
      stockQuantity: 50,
      category: 'PHYSICAL',
      isActive: true,
    },
    {
      name: 'AI Token Boost - 100K',
      description: 'Additional 100,000 AI tokens for the month',
      pointsCost: 2000,
      stockQuantity: 200,
      category: 'AI_TOKENS',
      isActive: true,
    },
  ];

  for (const reward of rewards) {
    // Check if reward exists by name
    const existing = await prisma.rewardCatalog.findFirst({
      where: { name: reward.name },
    });
    if (!existing) {
      await prisma.rewardCatalog.create({ data: reward });
    }
  }

  console.log('✅ Reward catalog created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });