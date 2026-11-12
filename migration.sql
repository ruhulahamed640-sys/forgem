-- ============================================================================
-- STUDYPILOT — INITIAL POSTGRESQL DATABASE MIGRATION (20261111000000_init)
-- Generated from prisma/schema.prisma | 82 Normalized Tables | UUID v4 PKs
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'DELETED');
CREATE TYPE "RoleName" AS ENUM ('STUDENT', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "PriorityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'OVERDUE', 'GRADED');
CREATE TYPE "ExamStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PlanPeriodType" AS ENUM ('DAILY', 'WEEKLY', 'CUSTOM');
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'RESCHEDULED');
CREATE TYPE "SpacedRepetitionAlgorithm" AS ENUM ('SM2', 'LEITNER', 'FSRS_LIGHT', 'CUSTOM_INTERVALS');
CREATE TYPE "StudySessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED', 'INVALIDATED');
CREATE TYPE "StudySessionEventType" AS ENUM ('START', 'PAUSE', 'RESUME', 'COMPLETE', 'HEARTBEAT', 'ABORT');
CREATE TYPE "AiJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "PointTransactionType" AS ENUM ('EARNED', 'REDEEMED', 'ADMIN_ADJUSTMENT', 'REVERSAL');
CREATE TYPE "LeaderboardPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME');
CREATE TYPE "RedemptionStatus" AS ENUM ('PENDING', 'APPROVED', 'FULFILLED', 'REJECTED', 'CANCELLED');
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH');
CREATE TYPE "NotificationCategory" AS ENUM ('ASSIGNMENT_REMINDER', 'EXAM_REMINDER', 'REVISION_REMINDER', 'STUDY_PLAN_REMINDER', 'ACHIEVEMENT', 'REWARD', 'SECURITY', 'SYSTEM');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED', 'EXPIRED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "email_verified_at" TIMESTAMPTZ,
  "last_login_at" TIMESTAMPTZ,
  "suspended_at" TIMESTAMPTZ,
  "suspension_reason" TEXT,
  "deleted_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_profiles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "first_name" VARCHAR(100) NOT NULL,
  "last_name" VARCHAR(100) NOT NULL,
  "display_name" VARCHAR(120),
  "avatar_storage_key" VARCHAR(512),
  "bio" TEXT,
  "date_of_birth" DATE,
  "phone" VARCHAR(32),
  "institution_id" UUID,
  "class_id" UUID,
  "academic_year_id" UUID,
  "timezone" VARCHAR(64) NOT NULL DEFAULT 'UTC',
  "locale" VARCHAR(16) NOT NULL DEFAULT 'en-US',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_settings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "daily_study_target_minutes" INTEGER NOT NULL DEFAULT 120,
  "weekly_study_target_minutes" INTEGER NOT NULL DEFAULT 840,
  "pomodoro_work_minutes" INTEGER NOT NULL DEFAULT 25,
  "pomodoro_break_minutes" INTEGER NOT NULL DEFAULT 5,
  "spaced_repetition_algorithm" "SpacedRepetitionAlgorithm" NOT NULL DEFAULT 'SM2',
  "custom_revision_intervals" JSONB,
  "leaderboard_opt_in" BOOLEAN NOT NULL DEFAULT true,
  "extension_sync_enabled" BOOLEAN NOT NULL DEFAULT true,
  "ai_assistance_enabled" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "client_id" VARCHAR(64) NOT NULL DEFAULT 'web-app',
  "device_name" VARCHAR(255),
  "ip_address" VARCHAR(64),
  "user_agent" TEXT,
  "is_revoked" BOOLEAN NOT NULL DEFAULT false,
  "revoked_at" TIMESTAMPTZ,
  "last_active_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "refresh_tokens" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "session_id" UUID NOT NULL,
  "token_family" UUID NOT NULL,
  "token_hash" VARCHAR(255) NOT NULL,
  "replaced_by_token_id" UUID,
  "is_revoked" BOOLEAN NOT NULL DEFAULT false,
  "revoked_at" TIMESTAMPTZ,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "email_verifications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "token_hash" VARCHAR(255) NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "verified_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "password_resets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "token_hash" VARCHAR(255) NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "used_at" TIMESTAMPTZ,
  "ip_address" VARCHAR(64),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "login_attempts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID,
  "email" VARCHAR(255) NOT NULL,
  "ip_address" VARCHAR(64) NOT NULL,
  "user_agent" TEXT,
  "client_id" VARCHAR(64) NOT NULL DEFAULT 'web-app',
  "is_successful" BOOLEAN NOT NULL,
  "failure_reason" VARCHAR(255),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "roles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" "RoleName" NOT NULL,
  "description" VARCHAR(255),
  "is_system" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "permissions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(120) NOT NULL,
  "module" VARCHAR(64) NOT NULL,
  "description" VARCHAR(255),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "role_permissions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "role_id" UUID NOT NULL,
  "permission_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_roles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "role_id" UUID NOT NULL,
  "assigned_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "academic_years" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "is_current" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "institutions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "code" VARCHAR(64) NOT NULL,
  "type" VARCHAR(64) NOT NULL DEFAULT 'UNIVERSITY',
  "country" VARCHAR(64),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "classes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "institution_id" UUID,
  "name" VARCHAR(120) NOT NULL,
  "grade_level" VARCHAR(64) NOT NULL,
  "section" VARCHAR(32),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subjects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "academic_year_id" UUID,
  "class_id" UUID,
  "name" VARCHAR(150) NOT NULL,
  "code" VARCHAR(40),
  "color_hex" VARCHAR(16) NOT NULL DEFAULT '#4F46E5',
  "icon" VARCHAR(64),
  "target_weekly_minutes" INTEGER NOT NULL DEFAULT 180,
  "is_archived" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subject_enrollments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "subject_id" UUID NOT NULL,
  "academic_year_id" UUID NOT NULL,
  "enrolled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "subject_enrollments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chapters" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "subject_id" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "order_index" INTEGER NOT NULL DEFAULT 1,
  "description" TEXT,
  "estimated_minutes" INTEGER NOT NULL DEFAULT 60,
  "is_completed" BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "topics" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "chapter_id" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "order_index" INTEGER NOT NULL DEFAULT 1,
  "content_summary" TEXT,
  "difficulty_level" INTEGER NOT NULL DEFAULT 3,
  "estimated_minutes" INTEGER NOT NULL DEFAULT 30,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_subject_progress" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "subject_id" UUID NOT NULL,
  "total_chapters" INTEGER NOT NULL DEFAULT 0,
  "completed_chapters" INTEGER NOT NULL DEFAULT 0,
  "total_topics" INTEGER NOT NULL DEFAULT 0,
  "completed_topics" INTEGER NOT NULL DEFAULT 0,
  "completion_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "total_study_minutes" INTEGER NOT NULL DEFAULT 0,
  "last_studied_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "student_subject_progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_topic_progress" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "topic_id" UUID NOT NULL,
  "is_completed" BOOLEAN NOT NULL DEFAULT false,
  "completion_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "confidence_score" INTEGER NOT NULL DEFAULT 3,
  "time_spent_minutes" INTEGER NOT NULL DEFAULT 0,
  "completed_at" TIMESTAMPTZ,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "student_topic_progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "academic_grades" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "subject_id" UUID NOT NULL,
  "academic_year_id" UUID NOT NULL,
  "term_name" VARCHAR(80) NOT NULL,
  "score_obtained" DECIMAL(6,2) NOT NULL,
  "max_score" DECIMAL(6,2) NOT NULL,
  "percentage" DECIMAL(5,2) NOT NULL,
  "letter_grade" VARCHAR(8) NOT NULL,
  "grade_points" DECIMAL(4,2),
  "remarks" TEXT,
  "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "academic_grades_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assignments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "subject_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "deadline" TIMESTAMPTZ NOT NULL,
  "priority" "PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
  "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
  "completion_percentage" INTEGER NOT NULL DEFAULT 0,
  "submitted_at" TIMESTAMPTZ,
  "completed_at" TIMESTAMPTZ,
  "teacher_feedback" TEXT,
  "is_overdue" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assignment_subjects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "assignment_id" UUID NOT NULL,
  "subject_id" UUID NOT NULL,
  "is_primary" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "assignment_subjects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assignment_attachments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "assignment_id" UUID NOT NULL,
  "uploaded_by_id" UUID NOT NULL,
  "file_name" VARCHAR(255) NOT NULL,
  "mime_type" VARCHAR(120) NOT NULL,
  "file_size_bytes" INTEGER NOT NULL,
  "storage_key" VARCHAR(512) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assignment_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assignment_submissions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "assignment_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "notes" TEXT,
  "attachment_keys" JSONB,
  "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "score_obtained" DECIMAL(6,2),
  "max_score" DECIMAL(6,2),
  "teacher_feedback" TEXT,
  CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assignment_comments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "assignment_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "author_role" "RoleName" NOT NULL DEFAULT 'STUDENT',
  "body" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assignment_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assignment_reminders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "assignment_id" UUID NOT NULL,
  "remind_at" TIMESTAMPTZ NOT NULL,
  "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
  "is_sent" BOOLEAN NOT NULL DEFAULT false,
  "sent_at" TIMESTAMPTZ,
  "job_id" VARCHAR(128),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assignment_reminders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exams" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "exam_type" VARCHAR(64) NOT NULL DEFAULT 'MIDTERM',
  "description" TEXT,
  "start_date" TIMESTAMPTZ NOT NULL,
  "end_date" TIMESTAMPTZ NOT NULL,
  "status" "ExamStatus" NOT NULL DEFAULT 'UPCOMING',
  "preparation_progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exam_subjects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "exam_id" UUID NOT NULL,
  "subject_id" UUID NOT NULL,
  "max_marks" DECIMAL(6,2) NOT NULL DEFAULT 100,
  "passing_marks" DECIMAL(6,2) NOT NULL DEFAULT 40,
  "syllabus_chapters" JSONB,
  "preparation_progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
  CONSTRAINT "exam_subjects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exam_schedules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "exam_id" UUID NOT NULL,
  "exam_subject_id" UUID NOT NULL,
  "exam_date" TIMESTAMPTZ NOT NULL,
  "duration_minutes" INTEGER NOT NULL DEFAULT 120,
  "room_or_venue" VARCHAR(120),
  "notes" TEXT,
  CONSTRAINT "exam_schedules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exam_results" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "exam_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "total_marks_obtained" DECIMAL(7,2) NOT NULL,
  "total_max_marks" DECIMAL(7,2) NOT NULL,
  "percentage" DECIMAL(5,2) NOT NULL,
  "overall_grade" VARCHAR(12) NOT NULL,
  "rank" INTEGER,
  "remarks" TEXT,
  "published_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exam_marks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "exam_result_id" UUID NOT NULL,
  "exam_subject_id" UUID NOT NULL,
  "marks_obtained" DECIMAL(6,2) NOT NULL,
  "max_marks" DECIMAL(6,2) NOT NULL,
  "percentage" DECIMAL(5,2) NOT NULL,
  "grade" VARCHAR(12) NOT NULL,
  "remarks" TEXT,
  CONSTRAINT "exam_marks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exam_reminders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "exam_id" UUID NOT NULL,
  "remind_at" TIMESTAMPTZ NOT NULL,
  "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
  "is_sent" BOOLEAN NOT NULL DEFAULT false,
  "sent_at" TIMESTAMPTZ,
  "job_id" VARCHAR(128),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "exam_reminders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "study_plans" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "period_type" "PlanPeriodType" NOT NULL DEFAULT 'WEEKLY',
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "target_minutes" INTEGER NOT NULL DEFAULT 600,
  "completed_minutes" INTEGER NOT NULL DEFAULT 0,
  "completion_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "study_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "study_plan_tasks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "study_plan_id" UUID NOT NULL,
  "subject_id" UUID,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "scheduled_date" TIMESTAMPTZ NOT NULL,
  "duration_minutes" INTEGER NOT NULL DEFAULT 45,
  "priority" "PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
  "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
  "rescheduled_from_date" TIMESTAMPTZ,
  "completed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "study_plan_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "study_goals" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "metric_type" VARCHAR(64) NOT NULL DEFAULT 'STUDY_MINUTES',
  "target_value" INTEGER NOT NULL,
  "current_value" INTEGER NOT NULL DEFAULT 0,
  "deadline" DATE NOT NULL,
  "is_achieved" BOOLEAN NOT NULL DEFAULT false,
  "achieved_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "study_goals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "study_routines" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "study_routines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "study_routine_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "routine_id" UUID NOT NULL,
  "day_of_week" INTEGER NOT NULL,
  "start_time" VARCHAR(8) NOT NULL,
  "end_time" VARCHAR(8) NOT NULL,
  "subject_id" UUID,
  "activity_title" VARCHAR(180) NOT NULL,
  CONSTRAINT "study_routine_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "daily_planner_entries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "plan_date" DATE NOT NULL,
  "focus_summary" VARCHAR(255),
  "planned_minutes" INTEGER NOT NULL DEFAULT 0,
  "actual_minutes" INTEGER NOT NULL DEFAULT 0,
  "completed_tasks_count" INTEGER NOT NULL DEFAULT 0,
  "missed_tasks_count" INTEGER NOT NULL DEFAULT 0,
  "reflection_notes" TEXT,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "daily_planner_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "revision_schedules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "revision_topic_id" UUID NOT NULL,
  "algorithm" "SpacedRepetitionAlgorithm" NOT NULL DEFAULT 'SM2',
  "repetition_number" INTEGER NOT NULL DEFAULT 0,
  "easiness_factor" DECIMAL(4,2) NOT NULL DEFAULT 2.50,
  "interval_days" INTEGER NOT NULL DEFAULT 1,
  "scheduled_for" TIMESTAMPTZ NOT NULL,
  "next_revision_date" TIMESTAMPTZ,
  "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
  "completed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "revision_schedules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "revision_topics" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "topic_id" UUID NOT NULL,
  "mastery_level" INTEGER NOT NULL DEFAULT 1,
  "last_reviewed_at" TIMESTAMPTZ,
  "total_reviews" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "revision_topics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "revision_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "revision_schedule_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "duration_minutes" INTEGER NOT NULL,
  "difficulty_rating" INTEGER NOT NULL,
  "recall_score" INTEGER NOT NULL DEFAULT 4,
  "notes" TEXT,
  "completed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "revision_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "revision_history" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "revision_schedule_id" UUID NOT NULL,
  "previous_interval" INTEGER NOT NULL,
  "new_interval" INTEGER NOT NULL,
  "previous_easiness" DECIMAL(4,2) NOT NULL,
  "new_easiness" DECIMAL(4,2) NOT NULL,
  "difficulty_rating" INTEGER NOT NULL,
  "next_revision_date" TIMESTAMPTZ NOT NULL,
  "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "revision_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "study_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "subject_id" UUID,
  "topic_id" UUID,
  "client_id" VARCHAR(64) NOT NULL DEFAULT 'web-app',
  "status" "StudySessionStatus" NOT NULL DEFAULT 'ACTIVE',
  "start_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "end_time" TIMESTAMPTZ,
  "actual_duration_seconds" INTEGER NOT NULL DEFAULT 0,
  "total_break_seconds" INTEGER NOT NULL DEFAULT 0,
  "completed_tasks_count" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "study_session_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "study_session_id" UUID NOT NULL,
  "event_type" "StudySessionEventType" NOT NULL,
  "server_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  CONSTRAINT "study_session_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "study_session_breaks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "study_session_id" UUID NOT NULL,
  "break_start" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "break_end" TIMESTAMPTZ,
  "duration_seconds" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "study_session_breaks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "study_statistics" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "stat_date" DATE NOT NULL,
  "total_study_seconds" INTEGER NOT NULL DEFAULT 0,
  "total_break_seconds" INTEGER NOT NULL DEFAULT 0,
  "sessions_completed" INTEGER NOT NULL DEFAULT 0,
  "tasks_completed" INTEGER NOT NULL DEFAULT 0,
  "streak_days" INTEGER NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "study_statistics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "note_folders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "parent_id" UUID,
  "color_hex" VARCHAR(16) NOT NULL DEFAULT '#6366F1',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "note_folders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "folder_id" UUID,
  "subject_id" UUID,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL,
  "is_pinned" BOOLEAN NOT NULL DEFAULT false,
  "is_archived" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "resource_categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(120) NOT NULL,
  "slug" VARCHAR(120) NOT NULL,
  "description" VARCHAR(255),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "resource_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saved_resources" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "category_id" UUID,
  "title" VARCHAR(255) NOT NULL,
  "url" TEXT,
  "description" TEXT,
  "is_bookmarked" BOOLEAN NOT NULL DEFAULT true,
  "tags" TEXT[] NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "saved_resources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "resource_attachments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "resource_id" UUID NOT NULL,
  "uploaded_by_id" UUID NOT NULL,
  "file_name" VARCHAR(255) NOT NULL,
  "mime_type" VARCHAR(120) NOT NULL,
  "file_size_bytes" INTEGER NOT NULL,
  "storage_key" VARCHAR(512) NOT NULL,
  "checksum_sha256" VARCHAR(64),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "resource_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_provider_configs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "provider_name" VARCHAR(64) NOT NULL,
  "model_name" VARCHAR(120) NOT NULL,
  "encrypted_api_key_ref" VARCHAR(255) NOT NULL,
  "is_primary" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "priority_order" INTEGER NOT NULL DEFAULT 1,
  "max_tokens_per_request" INTEGER NOT NULL DEFAULT 4096,
  "timeout_ms" INTEGER NOT NULL DEFAULT 30000,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_provider_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_conversations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "subject_id" UUID,
  "title" VARCHAR(255) NOT NULL,
  "context_type" VARCHAR(64) NOT NULL DEFAULT 'GENERAL_STUDY',
  "is_archived" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_messages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" UUID NOT NULL,
  "role" VARCHAR(32) NOT NULL,
  "content" TEXT NOT NULL,
  "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
  "completion_tokens" INTEGER NOT NULL DEFAULT 0,
  "total_tokens" INTEGER NOT NULL DEFAULT 0,
  "provider_used" VARCHAR(64) NOT NULL DEFAULT 'google-gemini',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_usage_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "feature" VARCHAR(64) NOT NULL,
  "provider" VARCHAR(64) NOT NULL,
  "model" VARCHAR(120) NOT NULL,
  "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
  "completion_tokens" INTEGER NOT NULL DEFAULT 0,
  "total_tokens" INTEGER NOT NULL DEFAULT 0,
  "latency_ms" INTEGER NOT NULL DEFAULT 0,
  "is_fallback" BOOLEAN NOT NULL DEFAULT false,
  "is_success" BOOLEAN NOT NULL DEFAULT true,
  "error_code" VARCHAR(64),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_generation_jobs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "job_type" VARCHAR(64) NOT NULL,
  "status" "AiJobStatus" NOT NULL DEFAULT 'QUEUED',
  "input_payload" JSONB NOT NULL,
  "output_payload" JSONB,
  "is_validated" BOOLEAN NOT NULL DEFAULT false,
  "error_message" TEXT,
  "completed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_generation_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reward_rules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "event_code" VARCHAR(80) NOT NULL,
  "description" VARCHAR(255) NOT NULL,
  "points_awarded" INTEGER NOT NULL,
  "max_daily_occurrences" INTEGER NOT NULL DEFAULT 10,
  "cooldown_seconds" INTEGER NOT NULL DEFAULT 60,
  "min_duration_seconds" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reward_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "point_transactions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "transaction_type" "PointTransactionType" NOT NULL,
  "event_code" VARCHAR(80) NOT NULL,
  "source_entity_id" VARCHAR(128) NOT NULL,
  "idempotency_key" VARCHAR(160) NOT NULL,
  "points_delta" INTEGER NOT NULL,
  "balance_after" INTEGER NOT NULL,
  "description" VARCHAR(255),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_points" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "total_points_earned" INTEGER NOT NULL DEFAULT 0,
  "current_balance" INTEGER NOT NULL DEFAULT 0,
  "total_points_spent" INTEGER NOT NULL DEFAULT 0,
  "current_streak_days" INTEGER NOT NULL DEFAULT 0,
  "longest_streak_days" INTEGER NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_points_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "leaderboard_snapshots" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "period" "LeaderboardPeriod" NOT NULL,
  "period_start" DATE NOT NULL,
  "period_end" DATE NOT NULL,
  "user_id" UUID NOT NULL,
  "points" INTEGER NOT NULL,
  "rank" INTEGER NOT NULL,
  "computed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "leaderboard_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "achievements" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(80) NOT NULL,
  "title" VARCHAR(150) NOT NULL,
  "description" VARCHAR(255) NOT NULL,
  "icon" VARCHAR(120),
  "criteria_type" VARCHAR(64) NOT NULL,
  "criteria_value" INTEGER NOT NULL,
  "bonus_points" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_achievements" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "achievement_id" UUID NOT NULL,
  "unlocked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reward_catalog" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(180) NOT NULL,
  "description" TEXT NOT NULL,
  "points_cost" INTEGER NOT NULL,
  "stock_quantity" INTEGER NOT NULL DEFAULT 100,
  "category" VARCHAR(64) NOT NULL DEFAULT 'DIGITAL_PERK',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reward_catalog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reward_redemptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "reward_id" UUID NOT NULL,
  "points_spent" INTEGER NOT NULL,
  "idempotency_key" VARCHAR(160) NOT NULL,
  "status" "RedemptionStatus" NOT NULL DEFAULT 'PENDING',
  "fulfilled_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "activity_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "activity_type" VARCHAR(80) NOT NULL,
  "entity_type" VARCHAR(64) NOT NULL,
  "entity_id" VARCHAR(128) NOT NULL,
  "metadata" JSONB,
  "occurred_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_templates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(80) NOT NULL,
  "category" "NotificationCategory" NOT NULL,
  "subject_template" VARCHAR(255) NOT NULL,
  "body_template" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "category" "NotificationCategory" NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "body" TEXT NOT NULL,
  "action_url" VARCHAR(512),
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "read_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_preferences" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "category" "NotificationCategory" NOT NULL,
  "in_app_enabled" BOOLEAN NOT NULL DEFAULT true,
  "email_enabled" BOOLEAN NOT NULL DEFAULT true,
  "push_enabled" BOOLEAN NOT NULL DEFAULT false,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_delivery_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "notification_id" UUID NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "status" VARCHAR(32) NOT NULL,
  "provider_ref" VARCHAR(255),
  "error_message" TEXT,
  "delivered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notification_delivery_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_devices" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "client_id" VARCHAR(64) NOT NULL,
  "push_token" VARCHAR(512),
  "platform" VARCHAR(64) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "last_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscription_plans" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(64) NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "price_cents" INTEGER NOT NULL,
  "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
  "billing_interval" VARCHAR(32) NOT NULL DEFAULT 'MONTHLY',
  "daily_ai_token_limit" INTEGER NOT NULL,
  "storage_quota_bytes" BIGINT NOT NULL,
  "features" JSONB NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscriptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "plan_id" UUID NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "external_subscription_id" VARCHAR(160),
  "current_period_start" TIMESTAMPTZ NOT NULL,
  "current_period_end" TIMESTAMPTZ NOT NULL,
  "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
  "cancelled_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_transactions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "subscription_id" UUID,
  "provider" VARCHAR(32) NOT NULL DEFAULT 'stripe',
  "provider_payment_id" VARCHAR(160) NOT NULL,
  "idempotency_key" VARCHAR(160) NOT NULL,
  "amount_cents" INTEGER NOT NULL,
  "currency" VARCHAR(8) NOT NULL DEFAULT 'USD',
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "refunded_amount_cents" INTEGER NOT NULL DEFAULT 0,
  "verified_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_webhooks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "provider" VARCHAR(32) NOT NULL,
  "provider_event_id" VARCHAR(160) NOT NULL,
  "event_type" VARCHAR(120) NOT NULL,
  "signature_verified" BOOLEAN NOT NULL DEFAULT false,
  "payload" JSONB NOT NULL,
  "processed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processing_status" VARCHAR(32) NOT NULL DEFAULT 'PROCESSED',
  CONSTRAINT "payment_webhooks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoices" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "subscription_id" UUID NOT NULL,
  "invoice_number" VARCHAR(64) NOT NULL,
  "amount_due_cents" INTEGER NOT NULL,
  "amount_paid_cents" INTEGER NOT NULL,
  "status" VARCHAR(32) NOT NULL DEFAULT 'PAID',
  "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscription_usage" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "subscription_id" UUID NOT NULL,
  "usage_date" DATE NOT NULL,
  "ai_tokens_used" INTEGER NOT NULL DEFAULT 0,
  "storage_bytes_used" BIGINT NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscription_usage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_actions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "admin_user_id" UUID NOT NULL,
  "action_type" VARCHAR(80) NOT NULL,
  "target_type" VARCHAR(64) NOT NULL,
  "target_id" VARCHAR(128) NOT NULL,
  "reason" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actor_user_id" UUID,
  "actor_role" VARCHAR(32),
  "action" VARCHAR(120) NOT NULL,
  "entity_type" VARCHAR(64) NOT NULL,
  "entity_id" VARCHAR(128),
  "ip_address" VARCHAR(64),
  "user_agent" TEXT,
  "before_state" JSONB,
  "after_state" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "system_settings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" VARCHAR(120) NOT NULL,
  "value" JSONB NOT NULL,
  "description" VARCHAR(255),
  "updated_by" UUID,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "feature_flags" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" VARCHAR(120) NOT NULL,
  "is_enabled" BOOLEAN NOT NULL DEFAULT false,
  "rollout_percentage" INTEGER NOT NULL DEFAULT 100,
  "description" VARCHAR(255),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "announcements" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" VARCHAR(255) NOT NULL,
  "body" TEXT NOT NULL,
  "target_role" "RoleName",
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "published_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMPTZ,
  CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_tickets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "subject" VARCHAR(255) NOT NULL,
  "category" VARCHAR(64) NOT NULL DEFAULT 'GENERAL',
  "priority" "PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
  "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_messages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ticket_id" UUID NOT NULL,
  "sender_id" UUID NOT NULL,
  "is_staff_reply" BOOLEAN NOT NULL DEFAULT false,
  "message_body" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

-- Indexes & Unique Constraints
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");
CREATE INDEX "user_profiles_institution_id_idx" ON "user_profiles"("institution_id");
CREATE INDEX "user_profiles_academic_year_id_idx" ON "user_profiles"("academic_year_id");
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");
CREATE INDEX "user_sessions_user_id_is_revoked_idx" ON "user_sessions"("user_id", "is_revoked");
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE INDEX "refresh_tokens_user_id_is_revoked_idx" ON "refresh_tokens"("user_id", "is_revoked");
CREATE INDEX "refresh_tokens_session_id_idx" ON "refresh_tokens"("session_id");
CREATE INDEX "refresh_tokens_token_family_idx" ON "refresh_tokens"("token_family");
CREATE UNIQUE INDEX "email_verifications_token_hash_key" ON "email_verifications"("token_hash");
CREATE INDEX "email_verifications_user_id_idx" ON "email_verifications"("user_id");
CREATE UNIQUE INDEX "password_resets_token_hash_key" ON "password_resets"("token_hash");
CREATE INDEX "password_resets_user_id_idx" ON "password_resets"("user_id");
CREATE INDEX "login_attempts_email_created_at_idx" ON "login_attempts"("email", "created_at");
CREATE INDEX "login_attempts_ip_address_created_at_idx" ON "login_attempts"("ip_address", "created_at");
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");
CREATE INDEX "permissions_module_idx" ON "permissions"("module");
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");
CREATE UNIQUE INDEX "academic_years_name_key" ON "academic_years"("name");
CREATE UNIQUE INDEX "institutions_code_key" ON "institutions"("code");
CREATE INDEX "classes_institution_id_idx" ON "classes"("institution_id");
CREATE UNIQUE INDEX "subjects_user_id_name_academic_year_id_key" ON "subjects"("user_id", "name", "academic_year_id");
CREATE INDEX "subjects_user_id_is_archived_idx" ON "subjects"("user_id", "is_archived");
CREATE UNIQUE INDEX "subject_enrollments_user_id_subject_id_academic_year_id_key" ON "subject_enrollments"("user_id", "subject_id", "academic_year_id");
CREATE INDEX "subject_enrollments_user_id_idx" ON "subject_enrollments"("user_id");
CREATE UNIQUE INDEX "chapters_subject_id_order_index_key" ON "chapters"("subject_id", "order_index");
CREATE INDEX "chapters_subject_id_idx" ON "chapters"("subject_id");
CREATE UNIQUE INDEX "topics_chapter_id_order_index_key" ON "topics"("chapter_id", "order_index");
CREATE INDEX "topics_chapter_id_idx" ON "topics"("chapter_id");
CREATE UNIQUE INDEX "student_subject_progress_user_id_subject_id_key" ON "student_subject_progress"("user_id", "subject_id");
CREATE INDEX "student_subject_progress_user_id_idx" ON "student_subject_progress"("user_id");
CREATE UNIQUE INDEX "student_topic_progress_user_id_topic_id_key" ON "student_topic_progress"("user_id", "topic_id");
CREATE INDEX "student_topic_progress_user_id_idx" ON "student_topic_progress"("user_id");
CREATE INDEX "academic_grades_user_id_academic_year_id_idx" ON "academic_grades"("user_id", "academic_year_id");
CREATE INDEX "assignments_user_id_status_idx" ON "assignments"("user_id", "status");
CREATE INDEX "assignments_user_id_deadline_idx" ON "assignments"("user_id", "deadline");
CREATE INDEX "assignments_subject_id_idx" ON "assignments"("subject_id");
CREATE UNIQUE INDEX "assignment_subjects_assignment_id_subject_id_key" ON "assignment_subjects"("assignment_id", "subject_id");
CREATE UNIQUE INDEX "assignment_attachments_storage_key_key" ON "assignment_attachments"("storage_key");
CREATE INDEX "assignment_attachments_assignment_id_idx" ON "assignment_attachments"("assignment_id");
CREATE INDEX "assignment_submissions_assignment_id_user_id_idx" ON "assignment_submissions"("assignment_id", "user_id");
CREATE INDEX "assignment_comments_assignment_id_idx" ON "assignment_comments"("assignment_id");
CREATE INDEX "assignment_reminders_remind_at_is_sent_idx" ON "assignment_reminders"("remind_at", "is_sent");
CREATE INDEX "exams_user_id_start_date_idx" ON "exams"("user_id", "start_date");
CREATE INDEX "exams_user_id_status_idx" ON "exams"("user_id", "status");
CREATE UNIQUE INDEX "exam_subjects_exam_id_subject_id_key" ON "exam_subjects"("exam_id", "subject_id");
CREATE INDEX "exam_schedules_exam_id_exam_date_idx" ON "exam_schedules"("exam_id", "exam_date");
CREATE UNIQUE INDEX "exam_results_exam_id_user_id_key" ON "exam_results"("exam_id", "user_id");
CREATE INDEX "exam_results_user_id_idx" ON "exam_results"("user_id");
CREATE UNIQUE INDEX "exam_marks_exam_result_id_exam_subject_id_key" ON "exam_marks"("exam_result_id", "exam_subject_id");
CREATE INDEX "exam_reminders_remind_at_is_sent_idx" ON "exam_reminders"("remind_at", "is_sent");
CREATE INDEX "study_plans_user_id_start_date_end_date_idx" ON "study_plans"("user_id", "start_date", "end_date");
CREATE INDEX "study_plan_tasks_study_plan_id_scheduled_date_idx" ON "study_plan_tasks"("study_plan_id", "scheduled_date");
CREATE INDEX "study_plan_tasks_status_idx" ON "study_plan_tasks"("status");
CREATE INDEX "study_goals_user_id_is_achieved_idx" ON "study_goals"("user_id", "is_achieved");
CREATE INDEX "study_routines_user_id_idx" ON "study_routines"("user_id");
CREATE INDEX "study_routine_items_routine_id_day_of_week_idx" ON "study_routine_items"("routine_id", "day_of_week");
CREATE UNIQUE INDEX "daily_planner_entries_user_id_plan_date_key" ON "daily_planner_entries"("user_id", "plan_date");
CREATE INDEX "revision_schedules_user_id_scheduled_for_status_idx" ON "revision_schedules"("user_id", "scheduled_for", "status");
CREATE UNIQUE INDEX "revision_topics_user_id_topic_id_key" ON "revision_topics"("user_id", "topic_id");
CREATE INDEX "revision_sessions_user_id_completed_at_idx" ON "revision_sessions"("user_id", "completed_at");
CREATE INDEX "revision_history_revision_schedule_id_idx" ON "revision_history"("revision_schedule_id");
CREATE INDEX "study_sessions_user_id_status_idx" ON "study_sessions"("user_id", "status");
CREATE INDEX "study_sessions_user_id_start_time_idx" ON "study_sessions"("user_id", "start_time");
CREATE INDEX "study_session_events_study_session_id_server_time_idx" ON "study_session_events"("study_session_id", "server_time");
CREATE INDEX "study_session_breaks_study_session_id_idx" ON "study_session_breaks"("study_session_id");
CREATE UNIQUE INDEX "study_statistics_user_id_stat_date_key" ON "study_statistics"("user_id", "stat_date");
CREATE INDEX "study_statistics_user_id_stat_date_idx" ON "study_statistics"("user_id", "stat_date");
CREATE UNIQUE INDEX "note_folders_user_id_name_key" ON "note_folders"("user_id", "name");
CREATE INDEX "note_folders_user_id_idx" ON "note_folders"("user_id");
CREATE INDEX "notes_user_id_is_archived_idx" ON "notes"("user_id", "is_archived");
CREATE INDEX "notes_subject_id_idx" ON "notes"("subject_id");
CREATE UNIQUE INDEX "resource_categories_name_key" ON "resource_categories"("name");
CREATE UNIQUE INDEX "resource_categories_slug_key" ON "resource_categories"("slug");
CREATE INDEX "saved_resources_user_id_is_bookmarked_idx" ON "saved_resources"("user_id", "is_bookmarked");
CREATE UNIQUE INDEX "resource_attachments_storage_key_key" ON "resource_attachments"("storage_key");
CREATE INDEX "resource_attachments_resource_id_idx" ON "resource_attachments"("resource_id");
CREATE UNIQUE INDEX "ai_provider_configs_provider_name_key" ON "ai_provider_configs"("provider_name");
CREATE INDEX "ai_conversations_user_id_created_at_idx" ON "ai_conversations"("user_id", "created_at");
CREATE INDEX "ai_messages_conversation_id_created_at_idx" ON "ai_messages"("conversation_id", "created_at");
CREATE INDEX "ai_usage_logs_user_id_created_at_idx" ON "ai_usage_logs"("user_id", "created_at");
CREATE INDEX "ai_generation_jobs_user_id_status_idx" ON "ai_generation_jobs"("user_id", "status");
CREATE UNIQUE INDEX "reward_rules_event_code_key" ON "reward_rules"("event_code");
CREATE UNIQUE INDEX "point_transactions_idempotency_key_key" ON "point_transactions"("idempotency_key");
CREATE INDEX "point_transactions_user_id_created_at_idx" ON "point_transactions"("user_id", "created_at");
CREATE INDEX "point_transactions_event_code_source_entity_id_idx" ON "point_transactions"("event_code", "source_entity_id");
CREATE UNIQUE INDEX "user_points_user_id_key" ON "user_points"("user_id");
CREATE INDEX "user_points_total_points_earned_idx" ON "user_points"("total_points_earned");
CREATE UNIQUE INDEX "leaderboard_snapshots_period_period_start_user_id_key" ON "leaderboard_snapshots"("period", "period_start", "user_id");
CREATE INDEX "leaderboard_snapshots_period_period_start_rank_idx" ON "leaderboard_snapshots"("period", "period_start", "rank");
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");
CREATE INDEX "user_achievements_user_id_idx" ON "user_achievements"("user_id");
CREATE UNIQUE INDEX "reward_redemptions_idempotency_key_key" ON "reward_redemptions"("idempotency_key");
CREATE INDEX "reward_redemptions_user_id_created_at_idx" ON "reward_redemptions"("user_id", "created_at");
CREATE INDEX "activity_logs_user_id_occurred_at_idx" ON "activity_logs"("user_id", "occurred_at");
CREATE UNIQUE INDEX "notification_templates_code_key" ON "notification_templates"("code");
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");
CREATE UNIQUE INDEX "notification_preferences_user_id_category_key" ON "notification_preferences"("user_id", "category");
CREATE INDEX "notification_delivery_logs_notification_id_idx" ON "notification_delivery_logs"("notification_id");
CREATE UNIQUE INDEX "user_devices_push_token_key" ON "user_devices"("push_token");
CREATE INDEX "user_devices_user_id_is_active_idx" ON "user_devices"("user_id", "is_active");
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");
CREATE UNIQUE INDEX "subscriptions_external_subscription_id_key" ON "subscriptions"("external_subscription_id");
CREATE INDEX "subscriptions_user_id_status_idx" ON "subscriptions"("user_id", "status");
CREATE INDEX "subscriptions_current_period_end_idx" ON "subscriptions"("current_period_end");
CREATE UNIQUE INDEX "payment_transactions_provider_payment_id_key" ON "payment_transactions"("provider_payment_id");
CREATE UNIQUE INDEX "payment_transactions_idempotency_key_key" ON "payment_transactions"("idempotency_key");
CREATE INDEX "payment_transactions_user_id_created_at_idx" ON "payment_transactions"("user_id", "created_at");
CREATE UNIQUE INDEX "payment_webhooks_provider_event_id_key" ON "payment_webhooks"("provider_event_id");
CREATE INDEX "payment_webhooks_provider_event_type_idx" ON "payment_webhooks"("provider", "event_type");
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");
CREATE INDEX "invoices_user_id_idx" ON "invoices"("user_id");
CREATE UNIQUE INDEX "subscription_usage_subscription_id_usage_date_key" ON "subscription_usage"("subscription_id", "usage_date");
CREATE INDEX "admin_actions_admin_user_id_created_at_idx" ON "admin_actions"("admin_user_id", "created_at");
CREATE INDEX "audit_logs_actor_user_id_created_at_idx" ON "audit_logs"("actor_user_id", "created_at");
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");
CREATE INDEX "announcements_is_active_published_at_idx" ON "announcements"("is_active", "published_at");
CREATE INDEX "support_tickets_user_id_status_idx" ON "support_tickets"("user_id", "status");
CREATE INDEX "support_messages_ticket_id_created_at_idx" ON "support_messages"("ticket_id", "created_at");

-- Foreign Key Constraints
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "user_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "classes" ADD CONSTRAINT "classes_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "subject_enrollments" ADD CONSTRAINT "subject_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subject_enrollments" ADD CONSTRAINT "subject_enrollments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subject_enrollments" ADD CONSTRAINT "subject_enrollments_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "topics" ADD CONSTRAINT "topics_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_subject_progress" ADD CONSTRAINT "student_subject_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_subject_progress" ADD CONSTRAINT "student_subject_progress_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_topic_progress" ADD CONSTRAINT "student_topic_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_topic_progress" ADD CONSTRAINT "student_topic_progress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "academic_grades" ADD CONSTRAINT "academic_grades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "academic_grades" ADD CONSTRAINT "academic_grades_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "academic_grades" ADD CONSTRAINT "academic_grades_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_subjects" ADD CONSTRAINT "assignment_subjects_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_subjects" ADD CONSTRAINT "assignment_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_attachments" ADD CONSTRAINT "assignment_attachments_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_comments" ADD CONSTRAINT "assignment_comments_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_comments" ADD CONSTRAINT "assignment_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_reminders" ADD CONSTRAINT "assignment_reminders_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exams" ADD CONSTRAINT "exams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exam_subjects" ADD CONSTRAINT "exam_subjects_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exam_subjects" ADD CONSTRAINT "exam_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_exam_subject_id_fkey" FOREIGN KEY ("exam_subject_id") REFERENCES "exam_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exam_marks" ADD CONSTRAINT "exam_marks_exam_result_id_fkey" FOREIGN KEY ("exam_result_id") REFERENCES "exam_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exam_marks" ADD CONSTRAINT "exam_marks_exam_subject_id_fkey" FOREIGN KEY ("exam_subject_id") REFERENCES "exam_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exam_reminders" ADD CONSTRAINT "exam_reminders_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "study_plans" ADD CONSTRAINT "study_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "study_plan_tasks" ADD CONSTRAINT "study_plan_tasks_study_plan_id_fkey" FOREIGN KEY ("study_plan_id") REFERENCES "study_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "study_plan_tasks" ADD CONSTRAINT "study_plan_tasks_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "study_goals" ADD CONSTRAINT "study_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "study_routines" ADD CONSTRAINT "study_routines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "study_routine_items" ADD CONSTRAINT "study_routine_items_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "study_routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "daily_planner_entries" ADD CONSTRAINT "daily_planner_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revision_schedules" ADD CONSTRAINT "revision_schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revision_schedules" ADD CONSTRAINT "revision_schedules_revision_topic_id_fkey" FOREIGN KEY ("revision_topic_id") REFERENCES "revision_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revision_topics" ADD CONSTRAINT "revision_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revision_sessions" ADD CONSTRAINT "revision_sessions_revision_schedule_id_fkey" FOREIGN KEY ("revision_schedule_id") REFERENCES "revision_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revision_sessions" ADD CONSTRAINT "revision_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revision_history" ADD CONSTRAINT "revision_history_revision_schedule_id_fkey" FOREIGN KEY ("revision_schedule_id") REFERENCES "revision_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "study_session_events" ADD CONSTRAINT "study_session_events_study_session_id_fkey" FOREIGN KEY ("study_session_id") REFERENCES "study_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "study_session_breaks" ADD CONSTRAINT "study_session_breaks_study_session_id_fkey" FOREIGN KEY ("study_session_id") REFERENCES "study_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "study_statistics" ADD CONSTRAINT "study_statistics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "note_folders" ADD CONSTRAINT "note_folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "note_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "saved_resources" ADD CONSTRAINT "saved_resources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_resources" ADD CONSTRAINT "saved_resources_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "resource_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "resource_attachments" ADD CONSTRAINT "resource_attachments_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "saved_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_generation_jobs" ADD CONSTRAINT "ai_generation_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_points" ADD CONSTRAINT "user_points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "reward_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_delivery_logs" ADD CONSTRAINT "notification_delivery_logs_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscription_usage" ADD CONSTRAINT "subscription_usage_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;