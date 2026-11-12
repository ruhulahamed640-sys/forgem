import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import databaseConfig from './config/database.config';
import securityConfig from './config/security.config';
import { PrismaModule } from './database/prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AcademicModule } from './modules/academic/academic.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { ExaminationsModule } from './modules/examinations/examinations.module';
import { PlannerModule } from './modules/planner/planner.module';
import { RevisionsModule } from './modules/revisions/revisions.module';
import { StudySessionsModule } from './modules/study-sessions/study-sessions.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotesModule } from './modules/notes/notes.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { AiModule } from './modules/ai/ai.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { StorageModule } from './modules/storage/storage.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TransformResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, databaseConfig, securityConfig],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    RolesModule,
    AcademicModule,
    SubjectsModule,
    ChaptersModule,
    AssignmentsModule,
    ExaminationsModule,
    PlannerModule,
    RevisionsModule,
    StudySessionsModule,
    AnalyticsModule,
    NotesModule,
    ResourcesModule,
    AiModule,
    LeaderboardModule,
    RewardsModule,
    NotificationsModule,
    SubscriptionsModule,
    PaymentsModule,
    StorageModule,
    AdminModule,
    AuditModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*');
  }
}
