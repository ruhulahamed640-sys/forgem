"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const configuration_1 = require("./config/configuration");
const database_config_1 = require("./config/database.config");
const security_config_1 = require("./config/security.config");
const prisma_module_1 = require("./database/prisma/prisma.module");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const roles_module_1 = require("./modules/roles/roles.module");
const academic_module_1 = require("./modules/academic/academic.module");
const subjects_module_1 = require("./modules/subjects/subjects.module");
const chapters_module_1 = require("./modules/chapters/chapters.module");
const assignments_module_1 = require("./modules/assignments/assignments.module");
const examinations_module_1 = require("./modules/examinations/examinations.module");
const planner_module_1 = require("./modules/planner/planner.module");
const revisions_module_1 = require("./modules/revisions/revisions.module");
const study_sessions_module_1 = require("./modules/study-sessions/study-sessions.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const notes_module_1 = require("./modules/notes/notes.module");
const resources_module_1 = require("./modules/resources/resources.module");
const ai_module_1 = require("./modules/ai/ai.module");
const leaderboard_module_1 = require("./modules/leaderboard/leaderboard.module");
const rewards_module_1 = require("./modules/rewards/rewards.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const payments_module_1 = require("./modules/payments/payments.module");
const storage_module_1 = require("./modules/storage/storage.module");
const admin_module_1 = require("./modules/admin/admin.module");
const audit_module_1 = require("./modules/audit/audit.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const security_headers_middleware_1 = require("./common/middleware/security-headers.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(security_headers_middleware_1.SecurityHeadersMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default, database_config_1.default, security_config_1.default],
            }),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            academic_module_1.AcademicModule,
            subjects_module_1.SubjectsModule,
            chapters_module_1.ChaptersModule,
            assignments_module_1.AssignmentsModule,
            examinations_module_1.ExaminationsModule,
            planner_module_1.PlannerModule,
            revisions_module_1.RevisionsModule,
            study_sessions_module_1.StudySessionsModule,
            analytics_module_1.AnalyticsModule,
            notes_module_1.NotesModule,
            resources_module_1.ResourcesModule,
            ai_module_1.AiModule,
            leaderboard_module_1.LeaderboardModule,
            rewards_module_1.RewardsModule,
            notifications_module_1.NotificationsModule,
            subscriptions_module_1.SubscriptionsModule,
            payments_module_1.PaymentsModule,
            storage_module_1.StorageModule,
            admin_module_1.AdminModule,
            audit_module_1.AuditModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: response_interceptor_1.TransformResponseInterceptor,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: global_exception_filter_1.GlobalExceptionFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map