# StudyPilot — REST API Reference (`/api/v1`)

Interactive OpenAPI / Swagger documentation is served at `/api/docs`.

## Response Envelopes
- **Success (`200 OK` / `201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Operation completed successfully",
    "data": {},
    "meta": {}
  }
  ```
- **Error (`400` / `401` / `403` / `404` / `409` / `429` / `500`)**:
  ```json
  {
    "success": false,
    "message": "Request could not be processed",
    "error": {
      "code": "VALIDATION_ERROR",
      "details": []
    }
  }
  ```

## Endpoint Summary
- **Auth**: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/verify-email`, `POST /auth/resend-verification`, `GET /auth/me`, `GET /auth/sessions`, `DELETE /auth/sessions/:id`
- **Users**: `GET /users/me`, `PATCH /users/me`, `DELETE /users/me`, `GET /users/me/settings`, `PATCH /users/me/settings`
- **Subjects & Chapters**: `GET /subjects`, `POST /subjects`, `GET /subjects/:id`, `PATCH /subjects/:id`, `DELETE /subjects/:id`, `POST /chapters`, `POST /chapters/:id/complete`, `POST /chapters/topics`
- **Assignments**: `GET /assignments`, `POST /assignments`, `GET /assignments/:id`, `PATCH /assignments/:id`, `DELETE /assignments/:id`, `POST /assignments/:id/complete`
- **Examinations**: `GET /exams`, `POST /exams`, `GET /exams/upcoming`, `GET /exams/:id`, `PATCH /exams/:id`, `DELETE /exams/:id`, `POST /exams/:id/results`
- **Study Planner**: `GET /planner`, `POST /planner`, `PATCH /planner/:id`, `DELETE /planner/:id`, `POST /planner/:id/complete`
- **Revisions**: `GET /revisions`, `POST /revisions`, `GET /revisions/upcoming`, `POST /revisions/:id/complete`
- **Study Sessions**: `POST /study-sessions/start`, `POST /study-sessions/:id/pause`, `POST /study-sessions/:id/resume`, `POST /study-sessions/:id/complete`, `GET /study-sessions/history`
- **Analytics**: `GET /analytics/overview`, `GET /analytics/study-time`, `GET /analytics/subject-progress`, `GET /analytics/assignment-performance`, `GET /analytics/exam-performance`, `GET /analytics/weekly-report`
- **AI Assistant**: `POST /ai/chat`, `POST /ai/generate-study-plan`, `POST /ai/summarize`, `POST /ai/explain-topic`, `GET /ai/usage`
- **Leaderboard**: `GET /leaderboard/daily`, `GET /leaderboard/weekly`, `GET /leaderboard/monthly`, `GET /leaderboard/all-time`, `GET /leaderboard/me`
- **Rewards**: `GET /rewards`, `GET /rewards/achievements`, `GET /rewards/history`, `POST /rewards/:id/redeem`
- **Notifications**: `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/read-all`, `GET /notifications/preferences`, `PATCH /notifications/preferences`
- **Subscriptions & Payments**: `GET /subscriptions/plans`, `GET /subscriptions/me`, `POST /subscriptions/checkout`, `GET /payments/history`, `POST /payments/webhook`
- **Administration**: `GET /admin/dashboard`, `GET /admin/users`, `GET /admin/users/:id`, `PATCH /admin/users/:id/status`, `GET /admin/analytics`, `GET /admin/leaderboard`, `GET /admin/rewards`, `POST /admin/rewards`, `PATCH /admin/rewards/:id`, `GET /admin/audit-logs`, `GET /admin/settings`, `PATCH /admin/settings`
