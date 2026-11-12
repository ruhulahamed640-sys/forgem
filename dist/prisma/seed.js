"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto = require("crypto");
const prisma = new client_1.PrismaClient();
function hashSeedPassword(password) {
    const salt = 'studypilot_dev_seed_salt_v1';
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return `$scrypt$v=1$s=${salt}$${derived}`;
}
async function main() {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
        throw new Error('SECURITY ABORT: Refusing to run development seed against production environment without ALLOW_PRODUCTION_SEED=true');
    }
    console.log('Starting StudyPilot idempotent database seed...');
    const roles = [
        { name: client_1.RoleName.STUDENT, description: 'Standard Student Role with full academic and productivity access' },
        { name: client_1.RoleName.ADMIN, description: 'Administrator Role for user, content, reward, and support management' },
        { name: client_1.RoleName.SUPER_ADMIN, description: 'Super Administrator Role with system-wide configuration and audit control' },
    ];
    const roleMap = {};
    for (const r of roles) {
        const created = await prisma.role.upsert({
            where: { name: r.name },
            update: { description: r.description },
            create: r,
        });
        roleMap[r.name] = created.id;
    }
    const permissions = [
        { code: 'subjects:manage_own', module: 'subjects', description: 'Create, update, delete own subjects' },
        { code: 'assignments:manage_own', module: 'assignments', description: 'Manage own assignments and submissions' },
        { code: 'exams:manage_own', module: 'examinations', description: 'Manage own exams and schedules' },
        { code: 'sessions:track_own', module: 'study-sessions', description: 'Track study sessions and statistics' },
        { code: 'ai:use_assistant', module: 'ai', description: 'Use AI study assistant within plan quotas' },
        { code: 'rewards:redeem_own', module: 'rewards', description: 'Redeem catalog rewards using earned points' },
        { code: 'admin:users:manage', module: 'admin', description: 'Manage user accounts and suspension status' },
        { code: 'admin:rewards:manage', module: 'admin', description: 'Create and update reward catalog and rules' },
        { code: 'admin:settings:manage', module: 'admin', description: 'Modify system settings and feature flags' },
        { code: 'admin:audit:read', module: 'audit', description: 'Inspect administrative and security audit logs' },
    ];
    for (const perm of permissions) {
        const p = await prisma.permission.upsert({
            where: { code: perm.code },
            update: { description: perm.description },
            create: perm,
        });
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: roleMap[client_1.RoleName.SUPER_ADMIN], permissionId: p.id } },
            update: {},
            create: { roleId: roleMap[client_1.RoleName.SUPER_ADMIN], permissionId: p.id },
        });
        if (!perm.code.startsWith('admin:settings')) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: roleMap[client_1.RoleName.ADMIN], permissionId: p.id } },
                update: {},
                create: { roleId: roleMap[client_1.RoleName.ADMIN], permissionId: p.id },
            });
        }
        if (!perm.code.startsWith('admin:')) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: roleMap[client_1.RoleName.STUDENT], permissionId: p.id } },
                update: {},
                create: { roleId: roleMap[client_1.RoleName.STUDENT], permissionId: p.id },
            });
        }
    }
    const academicYear = await prisma.academicYear.upsert({
        where: { name: '2026-2027 Academic Year' },
        update: { isCurrent: true },
        create: {
            name: '2026-2027 Academic Year',
            startDate: new Date('2026-08-01'),
            endDate: new Date('2027-05-31'),
            isCurrent: true,
        },
    });
    const institution = await prisma.institution.upsert({
        where: { code: 'SP-INST-001' },
        update: {},
        create: {
            name: 'StudyPilot National Institute of Technology',
            code: 'SP-INST-001',
            type: 'UNIVERSITY',
            country: 'IN',
        },
    });
    const freePlan = await prisma.subscriptionPlan.upsert({
        where: { code: 'FREE_TIER' },
        update: {},
        create: {
            code: 'FREE_TIER',
            name: 'StudyPilot Free',
            priceCents: 0,
            currency: 'USD',
            billingInterval: 'MONTHLY',
            dailyAiTokenLimit: 25000,
            storageQuotaBytes: BigInt(104857600),
            features: { aiStudyPlans: true, maxSubjects: 10, browserExtension: true, customSpacedRepetition: false },
        },
    });
    await prisma.subscriptionPlan.upsert({
        where: { code: 'PRO_MONTHLY' },
        update: {},
        create: {
            code: 'PRO_MONTHLY',
            name: 'StudyPilot Pro Monthly',
            priceCents: 999,
            currency: 'USD',
            billingInterval: 'MONTHLY',
            dailyAiTokenLimit: 500000,
            storageQuotaBytes: BigInt(10737418240),
            features: { aiStudyPlans: true, maxSubjects: 100, browserExtension: true, customSpacedRepetition: true, priorityAi: true },
        },
    });
    const rewardRules = [
        { eventCode: 'ASSIGNMENT_COMPLETED', description: 'Complete an assignment before or on deadline', pointsAwarded: 50, maxDailyOccurrences: 10, cooldownSeconds: 30, minDurationSeconds: 0 },
        { eventCode: 'ASSIGNMENT_COMPLETED_LATE', description: 'Complete an overdue assignment', pointsAwarded: 20, maxDailyOccurrences: 10, cooldownSeconds: 30, minDurationSeconds: 0 },
        { eventCode: 'STUDY_SESSION_COMPLETED', description: 'Complete a verified study session (>= 15 min)', pointsAwarded: 30, maxDailyOccurrences: 8, cooldownSeconds: 900, minDurationSeconds: 900 },
        { eventCode: 'REVISION_COMPLETED', description: 'Complete a scheduled spaced-repetition revision', pointsAwarded: 25, maxDailyOccurrences: 15, cooldownSeconds: 60, minDurationSeconds: 0 },
        { eventCode: 'STUDY_GOAL_ACHIEVED', description: 'Achieve a structured study goal', pointsAwarded: 100, maxDailyOccurrences: 3, cooldownSeconds: 300, minDurationSeconds: 0 },
        { eventCode: 'STREAK_MILESTONE_7D', description: 'Maintain a 7-day consistent study streak', pointsAwarded: 150, maxDailyOccurrences: 1, cooldownSeconds: 86400, minDurationSeconds: 0 },
    ];
    for (const rule of rewardRules) {
        await prisma.rewardRule.upsert({
            where: { eventCode: rule.eventCode },
            update: { pointsAwarded: rule.pointsAwarded, maxDailyOccurrences: rule.maxDailyOccurrences },
            create: rule,
        });
    }
    const achievements = [
        { code: 'FIRST_ASSIGNMENT', title: 'First Deliverable', description: 'Complete your first academic assignment', criteriaType: 'ASSIGNMENTS_COMPLETED', criteriaValue: 1, bonusPoints: 25 },
        { code: 'FOCUSED_SCHOLAR_10H', title: 'Focused Scholar', description: 'Accumulate 600 minutes of verified study sessions', criteriaType: 'TOTAL_STUDY_MINUTES', criteriaValue: 600, bonusPoints: 100 },
        { code: 'MEMORY_MASTER', title: 'Memory Master', description: 'Complete 10 spaced-repetition revision sessions', criteriaType: 'REVISIONS_COMPLETED', criteriaValue: 10, bonusPoints: 75 },
    ];
    for (const ach of achievements) {
        await prisma.achievement.upsert({
            where: { code: ach.code },
            update: {},
            create: ach,
        });
    }
    await prisma.rewardCatalog.createMany({
        data: [
            { name: '7-Day StudyPilot Pro Boost', description: 'Unlock Pro AI token quotas and custom analytics for 7 days', pointsCost: 500, stockQuantity: 1000, category: 'SUBSCRIPTION_PERK' },
            { name: 'Custom Dark-Mode Theme Pack', description: 'Unlock exclusive distraction-free terminal & OLED themes', pointsCost: 250, stockQuantity: 5000, category: 'DIGITAL_PERK' },
        ],
        skipDuplicates: true,
    });
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@studypilot.io' },
        update: {},
        create: {
            email: 'admin@studypilot.io',
            passwordHash: hashSeedPassword('AdminSecure#2026!'),
            status: client_1.AccountStatus.ACTIVE,
            emailVerifiedAt: new Date(),
            profile: {
                create: {
                    firstName: 'System',
                    lastName: 'Administrator',
                    displayName: 'StudyPilot Admin',
                    institutionId: institution.id,
                    academicYearId: academicYear.id,
                    timezone: 'Asia/Kolkata',
                },
            },
            settings: { create: {} },
            userPoints: { create: { totalPointsEarned: 0, currentBalance: 0 } },
        },
    });
    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: adminUser.id, roleId: roleMap[client_1.RoleName.SUPER_ADMIN] } },
        update: {},
        create: { userId: adminUser.id, roleId: roleMap[client_1.RoleName.SUPER_ADMIN] },
    });
    const studentUser = await prisma.user.upsert({
        where: { email: 'arjun.sharma@student.studypilot.io' },
        update: {},
        create: {
            email: 'arjun.sharma@student.studypilot.io',
            passwordHash: hashSeedPassword('StudentPass#2026!'),
            status: client_1.AccountStatus.ACTIVE,
            emailVerifiedAt: new Date(),
            profile: {
                create: {
                    firstName: 'Arjun',
                    lastName: 'Sharma',
                    displayName: 'Arjun S.',
                    institutionId: institution.id,
                    academicYearId: academicYear.id,
                    timezone: 'Asia/Kolkata',
                },
            },
            settings: {
                create: {
                    dailyStudyTargetMinutes: 150,
                    weeklyStudyTargetMinutes: 1050,
                    spacedRepetitionAlgorithm: client_1.SpacedRepetitionAlgorithm.SM2,
                },
            },
            userPoints: {
                create: {
                    totalPointsEarned: 180,
                    currentBalance: 180,
                    currentStreakDays: 4,
                    longestStreakDays: 7,
                },
            },
        },
    });
    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: studentUser.id, roleId: roleMap[client_1.RoleName.STUDENT] } },
        update: {},
        create: { userId: studentUser.id, roleId: roleMap[client_1.RoleName.STUDENT] },
    });
    await prisma.subscription.create({
        data: {
            userId: studentUser.id,
            planId: freePlan.id,
            status: 'ACTIVE',
            currentPeriodStart: new Date('2026-11-01'),
            currentPeriodEnd: new Date('2026-12-01'),
        },
    });
    const subject = await prisma.subject.upsert({
        where: {
            userId_name_academicYearId: {
                userId: studentUser.id,
                name: 'Distributed Systems & Database Engineering',
                academicYearId: academicYear.id,
            },
        },
        update: {},
        create: {
            userId: studentUser.id,
            academicYearId: academicYear.id,
            name: 'Distributed Systems & Database Engineering',
            code: 'CS-402',
            colorHex: '#2563EB',
            targetWeeklyMinutes: 240,
        },
    });
    const chapter1 = await prisma.chapter.upsert({
        where: { subjectId_orderIndex: { subjectId: subject.id, orderIndex: 1 } },
        update: {},
        create: {
            subjectId: subject.id,
            title: 'Transaction Isolation & MVCC Internals',
            orderIndex: 1,
            estimatedMinutes: 90,
            isCompleted: true,
            completedAt: new Date(),
        },
    });
    await prisma.topic.upsert({
        where: { chapterId_orderIndex: { chapterId: chapter1.id, orderIndex: 1 } },
        update: {},
        create: {
            chapterId: chapter1.id,
            title: 'Serializable Snapshot Isolation (SSI) in PostgreSQL',
            orderIndex: 1,
            difficultyLevel: 4,
            estimatedMinutes: 45,
        },
    });
    await prisma.assignment.create({
        data: {
            userId: studentUser.id,
            subjectId: subject.id,
            title: 'Implement B-Tree Buffer Pool Manager Benchmark',
            description: 'Benchmark LRU-K eviction policies under concurrent read/write workloads.',
            deadline: new Date(Date.now() + 5 * 86400 * 1000),
            priority: client_1.PriorityLevel.HIGH,
        },
    });
    await prisma.systemSetting.upsert({
        where: { key: 'platform.maintenance_mode' },
        update: {},
        create: {
            key: 'platform.maintenance_mode',
            value: { enabled: false, message: 'All systems operational' },
            description: 'Global maintenance mode switch',
        },
    });
    await prisma.aiProviderConfig.upsert({
        where: { providerName: 'google-gemini' },
        update: {},
        create: {
            providerName: 'google-gemini',
            modelName: 'gemini-2.5-flash',
            encryptedApiKeyRef: 'env:GEMINI_API_KEY',
            isPrimary: true,
            isActive: true,
            priorityOrder: 1,
            maxTokensPerRequest: 4096,
        },
    });
    console.log('StudyPilot seed completed successfully.');
}
main()
    .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map