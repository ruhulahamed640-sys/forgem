# StudyPilot — PostgreSQL Normalized Database Schema (85 Tables)

All 85 tables use `UUID` primary keys (`DEFAULT gen_random_uuid()`), UTC timestamps (`TIMESTAMPTZ`), explicit foreign key constraints (`ON DELETE CASCADE / SET NULL / RESTRICT`), and composite B-Tree indexes.

## Domain Breakdown (Sections 4A–4M)
1. **A. User & Authentication (12 Tables)**: `users`, `user_profiles`, `user_settings`, `user_sessions`, `refresh_tokens`, `email_verifications`, `password_resets`, `login_attempts`, `user_roles`, `roles`, `permissions`, `role_permissions`.
2. **B. Academic Management (10 Tables)**: `academic_years`, `institutions`, `classes`, `subjects`, `subject_enrollments`, `chapters`, `topics`, `student_subject_progress`, `student_topic_progress`, `academic_grades`.
3. **C. Assignment Management (6 Tables)**: `assignments`, `assignment_subjects`, `assignment_attachments`, `assignment_submissions`, `assignment_comments`, `assignment_reminders`.
4. **D. Examination Management (6 Tables)**: `exams`, `exam_subjects`, `exam_schedules`, `exam_results`, `exam_marks`, `exam_reminders`.
5. **E. Study Planner (6 Tables)**: `study_plans`, `study_plan_tasks`, `study_goals`, `study_routines`, `study_routine_items`, `daily_planner_entries`.
6. **F. Revision Management (4 Tables)**: `revision_schedules`, `revision_topics`, `revision_sessions`, `revision_history`.
7. **G. Study Session Tracking (4 Tables)**: `study_sessions`, `study_session_events`, `study_session_breaks`, `study_statistics`.
8. **H. Resources & Notes (5 Tables)**: `note_folders`, `notes`, `resource_categories`, `saved_resources`, `resource_attachments`.
9. **I. AI System (5 Tables)**: `ai_provider_configs`, `ai_conversations`, `ai_messages`, `ai_usage_logs`, `ai_generation_jobs`.
10. **J. Leaderboard & Rewards (9 Tables)**: `reward_rules`, `point_transactions`, `user_points`, `leaderboard_snapshots`, `achievements`, `user_achievements`, `reward_catalog`, `reward_redemptions`, `activity_logs`.
11. **K. Notification System (5 Tables)**: `notification_templates`, `notifications`, `notification_preferences`, `notification_delivery_logs`, `user_devices`.
12. **L. Subscription & Payment (6 Tables)**: `subscription_plans`, `subscriptions`, `payment_transactions`, `payment_webhooks`, `invoices`, `subscription_usage`.
13. **M. Administration & Audit (7 Tables)**: `admin_actions`, `audit_logs`, `system_settings`, `feature_flags`, `announcements`, `support_tickets`, `support_messages`.
