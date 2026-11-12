# StudyPilot — System & Modular Monolith Architecture

## 1. Architectural Overview
StudyPilot is engineered as a **Modular Monolith** built on **Node.js LTS**, **NestJS**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, **Redis**, and **BullMQ**. Every functional domain is isolated into its own NestJS module with strict service interfaces, DTO validation boundaries, and zero business logic inside HTTP controllers.

```
Client Applications (Web App, Popup & SidePanel Browser Extension, Mobile)
        │
        │ HTTPS / REST API (/api/v1)
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    NestJS API Gateway & Security Layer                  │
│  Helmet • Strict CORS • Rate Limiter • JwtAuthGuard • RolesGuard • CSRF │
└─────────────────────────────────────────────────────────────────────────┘
        │
        ├── AuthModule (JWT, Rotating Refresh Tokens, Reuse Detection, Sessions)
        ├── UsersModule & RolesModule (Profiles, Settings, RBAC Permissions)
        ├── AcademicModule, SubjectsModule, ChaptersModule (Progress & Grades)
        ├── AssignmentsModule (CRUD, Overdue Detection, 11-Step Completion)
        ├── ExaminationsModule (Schedules, Marks, Grade Calculation)
        ├── PlannerModule (Daily/Weekly Plans, Tasks, Missed-Task Handling)
        ├── RevisionsModule (Configurable Spaced Repetition: SM2/Leitner/FSRS)
        ├── StudySessionsModule (Server-Timed Sessions, Breaks, Anti-Abuse)
        ├── AnalyticsModule (Overview, Study Time, Subject/Exam/Weekly Reports)
        ├── NotesModule & ResourcesModule (Folders, Bookmarks, S3 Attachments)
        ├── AiModule (Provider-Independent Adapter: Gemini + Fallback + Quotas)
        ├── LeaderboardModule (Daily, Weekly, Monthly, All-Time UTC Rankings)
        ├── RewardsModule (Immutable Point Ledger, Achievements, Redemptions)
        ├── NotificationsModule (In-App, SMTP Email, Preferences, Templates)
        ├── SubscriptionsModule & PaymentsModule (Plans, Checkout, Webhooks)
        ├── StorageModule (S3 Presigned Uploads, MIME/Size Validation)
        └── AdminModule & AuditModule (User/System Management, Audit Trail)
```

## 2. Module Dependency Plan
- **Global Core Modules**: `ConfigModule`, `PrismaModule`, `AuthModule`, `RewardsModule`, `LeaderboardModule`, `StorageModule`.
- **Domain Service Communication**:
  - `AssignmentsService`, `StudySessionsService`, `RevisionsService`, and `PlannerService` emit verified server-side activity events into `RewardsService.processTrustedActivityEvent(...)`.
  - `AdminService` consumes `LeaderboardService` and records immutable mutations in `admin_actions` and `audit_logs`.
  - `AiService` depends on `IAiProviderAdapter` (`GeminiAiProvider` primary, `FallbackAiProvider` secondary) and checks active subscription quotas from `subscriptions` and `subscription_plans`.
