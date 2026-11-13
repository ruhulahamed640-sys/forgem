# Module 2 — Student Dashboard, Notifications & Subscription/Quota (Verified API Contract)

**Status:** verified against the running backend on 13 Nov 2026 (live Supabase PostgreSQL). Every JSON sample below was captured from a real HTTP response. Sample data came from a seeded student (`module2.rich@studypilot.test`) and a brand-new student with no data (`module2.empty@studypilot.test`); both were deleted after capture.
**Scope:** Dashboard overview, streak, statistics, subject progress, recent activity, daily goals, notifications, subscription status and AI quota gating.
**Important:** there is **no single `/dashboard` endpoint** for students. The screen must be composed from the endpoints in §2.

---

## 1. Environment, Headers & Envelope

### 1.1 Base URLs

| Environment | Base URL | Status |
|---|---|---|
| Development | `http://localhost:4000/api/v1` | **Verified live** |
| Swagger | `http://localhost:4000/api/docs` | **Verified live** |
| Staging | *not configured* | ❌ no staging deployment exists |
| Production (intended) | `https://api.studypilot.io/api/v1` | ⚠️ from `APP_URL`, not verified |

### 1.2 Headers

| Header | Required | Notes |
|---|---|---|
| `Authorization: Bearer <accessToken>` | **Yes** on all Module 2 endpoints except `GET /subscriptions/plans` | Custom HS256 JWT, 900 s lifetime |
| `Content-Type: application/json` | Yes for `PATCH`/`POST` bodies | 1 MB limit |
| `Accept: application/json` | Recommended | Not enforced |
| `X-Request-Id` | Optional | Echoed in the response header |
| `X-App-Version`, `X-Platform`, `X-Timezone` | ❌ **Do not send** | Not in the CORS allow-list → preflight fails; backend never reads them |
| `Cookie: sp_access_token` | Not used | Guard supports it but nothing sets it — use Bearer |
| `Cookie: studypilot_refresh_token` | Browser refresh only | Not needed for dashboard calls |

Observed response headers on a live `GET`:

```
content-type: application/json; charset=utf-8
etag: W/"51-a3bajzLxisAnA6cE0ufPUPXgf40"
x-ratelimit-limit: 100
x-ratelimit-remaining: 99
x-ratelimit-reset: 60
x-request-id: a711a33f-b847-4e6d-92b7-bad7c045fb93
```

There is **no `Cache-Control` header**. Do not rely on HTTP caching; cache in the app explicitly (§9).

### 1.3 Success envelope

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {}
}
```

- Every `GET` and `PATCH` returns **200**.
- `POST /notifications/read-all` returns **201** (all POSTs in this backend are 201).
- `data` is the payload directly: an object for single resources, an **array** for list endpoints.
- Prisma `Decimal` columns (`completionPercentage`, `easinessFactor`, `preparationProgress`) are serialized as **strings**, e.g. `"50"`, not numbers.

---

## 2. Endpoint Map (what to call for each dashboard block)

| Dashboard block | Method & path | Auth | Rate limit | Success |
|---|---|---|---|---|
| Profile + points + **streak** | `GET /users/me` | Bearer | 100/min | 200 |
| **Daily goal** target + pomodoro | `GET /users/me/settings` | Bearer | 100/min | 200 |
| Update daily goal | `PATCH /users/me/settings` | Bearer | 100/min | 200 |
| **Statistics / overview cards** | `GET /analytics/overview` | Bearer | 100/min | 200 |
| 30-day study chart | `GET /analytics/study-time` | Bearer | 100/min | 200 |
| **Subject progress cards** | `GET /analytics/subject-progress` | Bearer | 100/min | 200 |
| Full subject tree | `GET /subjects` | Bearer | 100/min | 200 |
| Weekly report | `GET /analytics/weekly-report` | Bearer | 100/min | 200 |
| Assignment performance | `GET /analytics/assignment-performance` | Bearer | 100/min | 200 |
| Exam performance | `GET /analytics/exam-performance` | Bearer | 100/min | 200 |
| **Today's scheduled tasks** | `GET /planner` | Bearer | 100/min | 200 |
| **Due revisions** | `GET /revisions/upcoming` | Bearer | 100/min | 200 |
| All revisions + history | `GET /revisions` | Bearer | 100/min | 200 |
| **Recent sessions** | `GET /study-sessions/history` | Bearer | 100/min | 200 |
| **Notifications** | `GET /notifications` | Bearer | 100/min | 200 |
| Mark one read | `PATCH /notifications/:id/read` | Bearer | 100/min | 200 |
| Mark all read | `POST /notifications/read-all` | Bearer | 100/min | **201** |
| Notification preferences | `GET/PATCH /notifications/preferences` | Bearer | 100/min | 200 |
| **Subscription status** | `GET /subscriptions/me` | Bearer | 100/min | 200 |
| Plans catalog | `GET /subscriptions/plans` | **Public** | 100/min | 200 |
| Checkout | `POST /subscriptions/checkout` | Bearer | 100/min | 201 |
| **AI quota** | `GET /ai/usage` | Bearer | **20/min** | 200 |
| Recent activity (points ledger) | `GET /rewards/history` | Bearer | 100/min | 200 |

**No role restriction** applies to any Module 2 route (`@Roles` is only used by `/admin/*`). Any authenticated, non-suspended user can call them.

The `Rate limit` column is **per route handler**, not a shared budget: each row has its own 100/min/IP bucket, so calling many different dashboard endpoints does not drain a common counter.
**No query parameters** are accepted by any endpoint in this module. `?date=`, `?timezone=`, `?page=`, `?limit=`, `?unreadOnly=` are all ignored — none of these controllers declare query DTOs.
**Not available:** `GET /dashboard`, `GET /dashboard/summary`, `GET /notifications/unread-count`, `GET /activity`, `GET/POST /goals`.

---

## 3. Analytics

### 3.1 Overview — `GET /analytics/overview`

No query parameters. Returns aggregate totals, incomplete assignments, upcoming exams and gamification.

**Populated — 200:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "totalStudyMinutes": 1152,
    "weeklyStudyMinutes": 558,
    "totalSessionsCompleted": 24,
    "assignmentCompletionRate": 33.33,
    "upcomingDeadlines": [
      {
        "id": "4eba93e8-d9ad-41be-98bb-a0ae7bb9918f",
        "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
        "subjectId": "03b07fe9-5a9d-4962-9f0d-42a192c2f48d",
        "title": "Kinematics Problem Set 3",
        "description": "Solve problems 1-15 from the workbook.",
        "deadline": "2026-11-16T23:00:00.000Z",
        "priority": "HIGH",
        "status": "PENDING",
        "completionPercentage": 0,
        "submittedAt": null,
        "completedAt": null,
        "teacherFeedback": null,
        "isOverdue": false,
        "createdAt": "2026-11-13T02:37:35.857Z",
        "updatedAt": "2026-11-13T02:37:35.857Z"
      },
      {
        "id": "0c89f2bb-39c6-48bb-8374-aee20fc39279",
        "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
        "subjectId": "b4740d4c-96b1-4236-aaee-789620f33ab1",
        "title": "Atomic Structure Lab Report",
        "description": "Submit the lab report with observation tables.",
        "deadline": "2026-11-18T12:00:00.000Z",
        "priority": "MEDIUM",
        "status": "IN_PROGRESS",
        "completionPercentage": 40,
        "submittedAt": null,
        "completedAt": null,
        "teacherFeedback": null,
        "isOverdue": false,
        "createdAt": "2026-11-13T02:37:35.857Z",
        "updatedAt": "2026-11-13T02:37:35.857Z"
      }
    ],
    "upcomingExams": [
      {
        "id": "630e7602-0db1-475d-9583-8bd7cb5d9fbc",
        "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
        "title": "HSC Physics Midterm",
        "examType": "MIDTERM",
        "description": "Chapters 1-4",
        "startDate": "2026-11-25T09:00:00.000Z",
        "endDate": "2026-11-25T12:00:00.000Z",
        "status": "UPCOMING",
        "preparationProgress": "35",
        "createdAt": "2026-11-13T02:37:37.534Z",
        "updatedAt": "2026-11-13T02:37:37.534Z"
      }
    ],
    "gamification": {
      "currentBalance": 1120,
      "totalPointsEarned": 1480,
      "currentStreakDays": 5
    }
  },
  "meta": {}
}
```

**Empty state — 200** (brand-new verified student):

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "totalStudyMinutes": 0,
    "weeklyStudyMinutes": 0,
    "totalSessionsCompleted": 0,
    "assignmentCompletionRate": 0,
    "upcomingDeadlines": [],
    "upcomingExams": [],
    "gamification": {
      "currentBalance": 0,
      "totalPointsEarned": 0,
      "currentStreakDays": 0
    }
  },
  "meta": {}
}
```

**Field rules**

| Field | Meaning |
|---|---|
| `totalStudyMinutes` | `floor(sum(totalStudySeconds)/60)` over **all** statistics rows |
| `weeklyStudyMinutes` | last **rolling 7 days** (`statDate >= now − 7 d`), **not** a Monday-start calendar week |
| `totalSessionsCompleted` | lifetime count |
| `assignmentCompletionRate` | `completed/total*100`, 2 decimals; only status `COMPLETED` counts (**`GRADED` is excluded here** even though the weekly report counts it) |
| `upcomingDeadlines` | max **5** assignments with status `PENDING`/`IN_PROGRESS`, ordered by `deadline ASC`. Past-due rows are included; `isOverdue` is only set by other flows |
| `upcomingExams` | max **5** exams with status `UPCOMING`, ordered by `startDate ASC` |
| `gamification.currentStreakDays` | copied from `UserPoint.currentStreakDays` (see warning in §3.9) |

---

### 3.2 Study time (30-day chart) — `GET /analytics/study-time`

**Populated — 200** (truncated to 3 of 12 returned days):

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "totalMinutesLast30Days": 1152,
    "dailyBreakdown": [
      { "date": "2026-10-31", "studyMinutes": 114, "breakMinutes": 9, "sessionsCompleted": 2 },
      { "date": "2026-11-01", "studyMinutes": 96, "breakMinutes": 5, "sessionsCompleted": 1 },
      { "date": "2026-11-02", "studyMinutes": 78, "breakMinutes": 13, "sessionsCompleted": 3 }
    ]
  },
  "meta": {}
}
```

**Empty state — 200:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { "totalMinutesLast30Days": 0, "dailyBreakdown": [] },
  "meta": {}
}
```

Rules:
- Window = last **30 days** including today, UTC dates (`YYYY-MM-DD`).
- **Only days that have a statistics row are returned** — there is no zero-fill. Your chart must generate a continuous 30-day axis and insert `0` for missing dates.
- Data is written only when a study session is completed, so a day with no study simply has no entry.
- Values are integers (minutes floored).

---

### 3.3 Subject progress — `GET /analytics/subject-progress`

Returns raw `student_subject_progress` rows with the joined `subject`. This is the best source for subject-progress cards.

**Populated — 200:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": "85d5f3ff-912b-4bc7-9bc5-d90a1a182fdc",
      "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
      "subjectId": "03b07fe9-5a9d-4962-9f0d-42a192c2f48d",
      "totalChapters": 2,
      "completedChapters": 1,
      "totalTopics": 4,
      "completedTopics": 2,
      "completionPercentage": "50",
      "totalStudyMinutes": 265,
      "lastStudiedAt": "2026-11-12T20:37:34.528Z",
      "updatedAt": "2026-11-13T02:37:34.535Z",
      "subject": {
        "id": "03b07fe9-5a9d-4962-9f0d-42a192c2f48d",
        "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
        "academicYearId": null,
        "classId": null,
        "name": "Physics",
        "code": "PHY",
        "colorHex": "#2563EB",
        "icon": "atom",
        "targetWeeklyMinutes": 240,
        "isArchived": false,
        "createdAt": "2026-11-13T02:37:19.783Z",
        "updatedAt": "2026-11-13T02:37:19.783Z"
      }
    },
    {
      "id": "7298cab0-fd17-4df7-95b0-71681fe2ddf3",
      "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
      "subjectId": "b4740d4c-96b1-4236-aaee-789620f33ab1",
      "totalChapters": 1,
      "completedChapters": 0,
      "totalTopics": 1,
      "completedTopics": 0,
      "completionPercentage": "0",
      "totalStudyMinutes": 80,
      "lastStudiedAt": "2026-11-11T20:37:34.528Z",
      "updatedAt": "2026-11-13T02:37:34.535Z",
      "subject": {
        "id": "b4740d4c-96b1-4236-aaee-789620f33ab1",
        "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
        "academicYearId": null,
        "classId": null,
        "name": "Chemistry",
        "code": "CHE",
        "colorHex": "#059669",
        "icon": "flask",
        "targetWeeklyMinutes": 180,
        "isArchived": false,
        "createdAt": "2026-11-13T02:37:26.215Z",
        "updatedAt": "2026-11-13T02:37:26.215Z"
      }
    }
  ],
  "meta": {}
}
```

**Empty state — 200:** `{"success":true,"message":"Operation completed successfully","data":[],"meta":{}}`

Rules and caveats:
- Rows exist only after a subject's progress is recalculated (creating/completing chapters or adding a subject). A subject with no progress row will not appear — merge with `GET /subjects` if you need every subject.
- `completionPercentage` is a **string**.
- **It is chapter-based**, not topic-based: `round(completedChapters / totalChapters * 100, 2)`.
- `completedTopics` is **never incremented by any backend code path** (only `totalTopics` is recalculated). Treat it as `0` and do not display a topic-based bar.
- `totalStudyMinutes` here is **not** updated by study sessions (session completion updates `StudyStatistic` only). Do not use it as "time spent on subject".

Use `GET /subjects` when you need the full tree (chapters/topics) for subject detail screens:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": "03b07fe9-5a9d-4962-9f0d-42a192c2f48d",
      "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
      "academicYearId": null,
      "classId": null,
      "name": "Physics",
      "code": "PHY",
      "colorHex": "#2563EB",
      "icon": "atom",
      "targetWeeklyMinutes": 240,
      "isArchived": false,
      "createdAt": "2026-11-13T02:37:19.783Z",
      "updatedAt": "2026-11-13T02:37:19.783Z",
      "chapters": [
        {
          "id": "9f03644a-ccc3-4761-94ad-9f376a688583",
          "subjectId": "03b07fe9-5a9d-4962-9f0d-42a192c2f48d",
          "title": "Vectors & Kinematics",
          "orderIndex": 1,
          "description": null,
          "estimatedMinutes": 180,
          "isCompleted": true,
          "completedAt": "2026-11-04T02:37:19.776Z",
          "createdAt": "2026-11-13T02:37:19.783Z",
          "updatedAt": "2026-11-13T02:37:19.783Z",
          "topics": [
            {
              "id": "70aba714-f4e5-4d6d-8d2a-6a27d1ecbaa0",
              "chapterId": "9f03644a-ccc3-4761-94ad-9f376a688583",
              "title": "Scalars vs Vectors",
              "orderIndex": 1,
              "contentSummary": null,
              "difficultyLevel": 2,
              "estimatedMinutes": 40,
              "createdAt": "2026-11-13T02:37:19.783Z",
              "updatedAt": "2026-11-13T02:37:19.783Z"
            }
          ]
        }
      ],
      "subjectProgress": [
        {
          "id": "85d5f3ff-912b-4bc7-9bc5-d90a1a182fdc",
          "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
          "subjectId": "03b07fe9-5a9d-4962-9f0d-42a192c2f48d",
          "totalChapters": 2,
          "completedChapters": 1,
          "totalTopics": 4,
          "completedTopics": 2,
          "completionPercentage": "50",
          "totalStudyMinutes": 265,
          "lastStudiedAt": "2026-11-12T20:37:34.528Z",
          "updatedAt": "2026-11-13T02:37:34.535Z"
        }
      ]
    }
  ],
  "meta": {}
}
```

(Only one of two chapters is shown above; the real response contains both. Archived subjects are excluded.)

---

### 3.4 Weekly report — `GET /analytics/weekly-report`

**200:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "generatedAt": "2026-11-13T02:40:01.292Z",
    "weeklyStudyMinutes": 558,
    "revisionsCompletedThisWeek": 2,
    "goalsAchievedTotal": 2,
    "assignmentPerformance": {
      "totalAssignments": 3,
      "completedAssignments": 1,
      "overdueAssignments": 0,
      "onTimeCompletionRate": 100,
      "completionRate": 33.33
    },
    "examPerformance": {
      "examsEvaluated": 0,
      "averagePercentage": 0,
      "history": []
    }
  },
  "meta": {}
}
```

**Empty state — 200:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "generatedAt": "2026-11-13T02:38:39.091Z",
    "weeklyStudyMinutes": 0,
    "revisionsCompletedThisWeek": 0,
    "goalsAchievedTotal": 0,
    "assignmentPerformance": {
      "totalAssignments": 0,
      "completedAssignments": 0,
      "overdueAssignments": 0,
      "onTimeCompletionRate": 0,
      "completionRate": 0
    },
    "examPerformance": {
      "examsEvaluated": 0,
      "averagePercentage": 0,
      "history": []
    }
  },
  "meta": {}
}
```

- `revisionsCompletedThisWeek` = revision **sessions** completed in the last rolling 7 days.
- `goalsAchievedTotal` is **all-time**, not weekly.
- `assignmentPerformance.completedAssignments` counts `COMPLETED` + `GRADED` / `onTimeCompletionRate` is based on `completedAt <= deadline`.
- `examPerformance.history` contains full exam-result rows (including decimal strings); `averagePercentage` is a number.

`GET /analytics/assignment-performance` and `GET /analytics/exam-performance` expose the same two sub-objects on their own (same shapes, not separately sampled here).

---

## 4. Streak, Points & Daily Goals (Users)

### 4.1 `GET /users/me` (streak + points)

**200** (same shape as Module 1; shortened here):

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
    "email": "module2.rich@studypilot.test",
    "status": "ACTIVE",
    "emailVerifiedAt": "2026-10-14T02:37:02.649Z",
    "profile": {
      "id": "0844ca5f-e948-4cf8-b7ab-6147f4b36bf3",
      "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
      "firstName": "Nusrat",
      "lastName": "Jahan",
      "displayName": "Nusrat Jahan",
      "avatarStorageKey": null,
      "bio": "HSC 2026 candidate aiming for medical admission.",
      "dateOfBirth": "2008-04-12T00:00:00.000Z",
      "phone": "+8801700000000",
      "institutionId": null,
      "classId": null,
      "academicYearId": null,
      "timezone": "Asia/Dhaka",
      "locale": "en-US",
      "createdAt": "2026-11-13T02:37:02.732Z",
      "updatedAt": "2026-11-13T02:37:02.732Z",
      "institution": null,
      "academicYear": null,
      "academicClass": null
    },
    "points": {
      "id": "d0b497f7-8e05-491e-a3c3-e88e5cb84848",
      "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
      "totalPointsEarned": 1480,
      "currentBalance": 1120,
      "totalPointsSpent": 360,
      "currentStreakDays": 5,
      "longestStreakDays": 12,
      "updatedAt": "2026-11-13T02:37:02.732Z"
    },
    "roles": ["STUDENT"]
  },
  "meta": {}
}
```

**Streak fields:** `points.currentStreakDays` and `points.longestStreakDays` (identical values in `analytics/overview.gamification.currentStreakDays`). A new user starts at `0`.

> ⚠️ **Backend gap:** no code path updates `UserPoint.currentStreakDays` / `longestStreakDays`. Study-session completion writes `StudyStatistic.streakDays = 1` for the day but never rolls it into a counter. The values above were inserted by the seed; **real users will always see `0`** until this is implemented. Do not build streak rewards on it yet.

### 4.2 `GET /users/me/settings` (daily goal)

**200:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "bd932215-a77d-424b-adb6-ba30d011f5cc",
    "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
    "dailyStudyTargetMinutes": 150,
    "weeklyStudyTargetMinutes": 900,
    "pomodoroWorkMinutes": 25,
    "pomodoroBreakMinutes": 5,
    "spacedRepetitionAlgorithm": "SM2",
    "customRevisionIntervals": null,
    "leaderboardOptIn": true,
    "extensionSyncEnabled": true,
    "aiAssistanceEnabled": true,
    "createdAt": "2026-11-13T02:37:02.732Z",
    "updatedAt": "2026-11-13T02:37:02.732Z"
  },
  "meta": {}
}
```

A newly registered user gets this row with defaults (`dailyStudyTargetMinutes: 120`, `weeklyStudyTargetMinutes: 840`), so the endpoint never returns `null` for a registered user.

### 4.3 `PATCH /users/me/settings` (the only way to change the daily goal)

**Request — 200** (all fields optional; only send what changes):

```json
{ "dailyStudyTargetMinutes": 180 }
```

**Response — 200** (full updated settings object, `updatedAt` changed):

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "bd932215-a77d-424b-adb6-ba30d011f5cc",
    "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
    "dailyStudyTargetMinutes": 180,
    "weeklyStudyTargetMinutes": 900,
    "pomodoroWorkMinutes": 25,
    "pomodoroBreakMinutes": 5,
    "spacedRepetitionAlgorithm": "SM2",
    "customRevisionIntervals": null,
    "leaderboardOptIn": true,
    "extensionSyncEnabled": true,
    "aiAssistanceEnabled": true,
    "createdAt": "2026-11-13T02:37:02.732Z",
    "updatedAt": "2026-11-13T02:40:18.299Z"
  },
  "meta": {}
}
```

Validation:

| Field | Type | Range |
|---|---|---|
| `dailyStudyTargetMinutes` | int | **15–960** |
| `weeklyStudyTargetMinutes` | int | **60–6720** |
| `pomodoroWorkMinutes` | int | **10–120** |
| `pomodoroBreakMinutes` | int | **3–60** |
| `spacedRepetitionAlgorithm` | enum | `SM2`, `LEITNER`, `FSRS_LIGHT`, `CUSTOM_INTERVALS` |
| `leaderboardOptIn`, `extensionSyncEnabled`, `aiAssistanceEnabled` | boolean | — |

**400 sample** (`dailyStudyTargetMinutes: 5`):

```json
{
  "success": false,
  "message": "Validation failed for one or more fields",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "dailyStudyTargetMinutes",
        "messages": ["dailyStudyTargetMinutes must not be less than 15"]
      }
    ]
  }
}
```

> There is **no `StudyGoal` API**. The `study_goals` table only feeds `goalsAchievedTotal` in the weekly report. "Daily goal" for this screen = `dailyStudyTargetMinutes` vs today's `studyMinutes`; "tasks goal" does not exist as editable data.

---

## 5. Today's Plan & Revisions

### 5.1 `GET /planner` — all plans + tasks

Every call first flips **past-due `PENDING` tasks to `MISSED`** (a write on read), then returns all plans ordered by `startDate DESC`.

**200** (one plan shown; one of four tasks omitted):

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": "9148b5f8-bbf2-493d-ad44-b68ddc56aecc",
      "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
      "title": "Week 8 — Physics + Chemistry push",
      "description": "Balance board syllabus with revision.",
      "periodType": "WEEKLY",
      "startDate": "2026-11-11T00:00:00.000Z",
      "endDate": "2026-11-18T00:00:00.000Z",
      "targetMinutes": 900,
      "completedMinutes": 95,
      "completionPercentage": "10.56",
      "isAiGenerated": false,
      "createdAt": "2026-11-13T02:37:56.747Z",
      "updatedAt": "2026-11-13T02:37:56.747Z",
      "tasks": [
        {
          "id": "bffb3f53-6f70-4be6-bd63-f37e3aafc074",
          "studyPlanId": "9148b5f8-bbf2-493d-ad44-b68ddc56aecc",
          "subjectId": "03b07fe9-5a9d-4962-9f0d-42a192c2f48d",
          "title": "Newton laws recap",
          "description": null,
          "scheduledDate": "2026-11-12T18:00:00.000Z",
          "durationMinutes": 40,
          "priority": "HIGH",
          "status": "MISSED",
          "rescheduledFromDate": null,
          "completedAt": null,
          "createdAt": "2026-11-13T02:37:56.747Z",
          "updatedAt": "2026-11-13T02:40:28.419Z",
          "subject": {
            "id": "03b07fe9-5a9d-4962-9f0d-42a192c2f48d",
            "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
            "academicYearId": null,
            "classId": null,
            "name": "Physics",
            "code": "PHY",
            "colorHex": "#2563EB",
            "icon": "atom",
            "targetWeeklyMinutes": 240,
            "isArchived": false,
            "createdAt": "2026-11-13T02:37:19.783Z",
            "updatedAt": "2026-11-13T02:37:19.783Z"
          }
        },
        {
          "id": "42920fd4-b7d4-42f3-8c04-64a9f22314c5",
          "studyPlanId": "9148b5f8-bbf2-493d-ad44-b68ddc56aecc",
          "subjectId": "03b07fe9-5a9d-4962-9f0d-42a192c2f48d",
          "title": "Kinematics problem drill",
          "description": null,
          "scheduledDate": "2026-11-13T08:00:00.000Z",
          "durationMinutes": 50,
          "priority": "HIGH",
          "status": "COMPLETED",
          "rescheduledFromDate": null,
          "completedAt": "2026-11-13T01:07:56.728Z",
          "createdAt": "2026-11-13T02:37:56.747Z",
          "updatedAt": "2026-11-13T02:37:56.747Z",
          "subject": {
            "id": "03b07fe9-5a9d-4962-9f0d-42a192c2f48d",
            "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
            "academicYearId": null,
            "classId": null,
            "name": "Physics",
            "code": "PHY",
            "colorHex": "#2563EB",
            "icon": "atom",
            "targetWeeklyMinutes": 240,
            "isArchived": false,
            "createdAt": "2026-11-13T02:37:19.783Z",
            "updatedAt": "2026-11-13T02:37:19.783Z"
          }
        },
        {
          "id": "3e492c7f-4b3d-4a1b-a927-5bed31d4a592",
          "studyPlanId": "9148b5f8-bbf2-493d-ad44-b68ddc56aecc",
          "subjectId": "b4740d4c-96b1-4236-aaee-789620f33ab1",
          "title": "Atomic structure revision",
          "description": null,
          "scheduledDate": "2026-11-13T18:00:00.000Z",
          "durationMinutes": 45,
          "priority": "MEDIUM",
          "status": "PENDING",
          "rescheduledFromDate": null,
          "completedAt": null,
          "createdAt": "2026-11-13T02:37:56.747Z",
          "updatedAt": "2026-11-13T02:37:56.747Z",
          "subject": {
            "id": "b4740d4c-96b1-4236-aaee-789620f33ab1",
            "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
            "academicYearId": null,
            "classId": null,
            "name": "Chemistry",
            "code": "CHE",
            "colorHex": "#059669",
            "icon": "flask",
            "targetWeeklyMinutes": 180,
            "isArchived": false,
            "createdAt": "2026-11-13T02:37:26.215Z",
            "updatedAt": "2026-11-13T02:37:26.215Z"
          }
        }
      ]
    }
  ],
  "meta": {}
}
```

**Empty state — 200:** `data: []`

Rules:
- No date filter — fetch once and filter in the client.
- "Today" is **UTC**; the MISSED pass uses `setUTCHours(0,0,0,0)`.
- Task statuses: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `MISSED`, `RESCHEDULED`.
- Completing a task is `POST /planner/:id/complete` (returns `{completedTaskId, plan}`); already-completed → `400 TASK_ALREADY_COMPLETED`; foreign plan → `403 PLAN_OWNERSHIP_VIOLATION`; unknown id → completes the plan itself, or `404 PLAN_NOT_FOUND`.

### 5.2 `GET /revisions/upcoming` — due revisions

Returns **all `PENDING` schedules**, regardless of whether `scheduledFor` is in the past, ordered by `scheduledFor ASC`.

**200:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": "d1f86b2b-1863-4354-a5d8-3f6d9ff4b4c3",
      "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
      "revisionTopicId": "4dc3c8f3-47e4-4606-82ba-dcbaea2a5b55",
      "algorithm": "SM2",
      "repetitionNumber": 2,
      "easinessFactor": "2.5",
      "intervalDays": 3,
      "scheduledFor": "2026-11-14T09:00:00.000Z",
      "nextRevisionDate": "2026-11-17T09:00:00.000Z",
      "status": "PENDING",
      "completedAt": null,
      "createdAt": "2026-11-13T02:38:00.398Z",
      "updatedAt": "2026-11-13T02:38:00.398Z",
      "revisionTopic": {
        "id": "4dc3c8f3-47e4-4606-82ba-dcbaea2a5b55",
        "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
        "topicId": "a71c8c5e-8448-47d9-8a46-2a228cdcacc7",
        "masteryLevel": 2,
        "lastReviewedAt": "2026-11-11T02:37:59.370Z",
        "totalReviews": 2,
        "createdAt": "2026-11-13T02:37:59.383Z",
        "topic": {
          "id": "a71c8c5e-8448-47d9-8a46-2a228cdcacc7",
          "chapterId": "018a1978-6d41-4186-adaa-2f7fbbdde0bb",
          "title": "Friction",
          "orderIndex": 2,
          "contentSummary": null,
          "difficultyLevel": 4,
          "estimatedMinutes": 45,
          "createdAt": "2026-11-13T02:37:19.783Z",
          "updatedAt": "2026-11-13T02:37:19.783Z"
        }
      }
    }
  ],
  "meta": {}
}
```

**Empty state — 200:** `data: []`

- The revision title shown to users must come from `revisionTopic.topic.title` (and `chapterId`); this endpoint does **not** include the chapter object.
- Complete via `POST /revisions/:id/complete` with `{difficultyRating, durationMinutes, notes?}`.
- `GET /revisions` additionally includes `history` (last 5 entries) and gives all statuses.

---

## 6. Recent Activity & Recent Sessions

### 6.1 There is no user activity feed

`ActivityLog` is written internally but exposed only through admin/audit endpoints (`/admin/audit-logs`, role-restricted). There is **no `GET /activity`**.

For a "Recent Activity" card, use one (or combine) of:

| Source | Endpoint | Shape |
|---|---|---|
| Notifications | `GET /notifications` | id, category, title, body, actionUrl, isRead, createdAt |
| Study sessions | `GET /study-sessions/history` | sessions with subject/topic, duration, notes |
| Points ledger | `GET /rewards/history` | `{transactions[], redemptions[]}` (100 transactions max) |

`GET /rewards/history` returns `PointTransaction` rows (`pointsDelta`, `balanceAfter`, `eventCode`, `description`, `createdAt`) and redemptions with the reward catalog; transactions are the closest thing to a chronological achievement feed.

### 6.2 `GET /study-sessions/history`

Returns the newest **50** sessions (all statuses) + newest **30** daily statistics.

**200** (one session shown, truncated):

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "sessions": [
      {
        "id": "b34f6a5a-53d7-47b3-886b-6b2ed41bbd31",
        "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
        "subjectId": "03b07fe9-5a9d-4962-9f0d-42a192c2f48d",
        "topicId": "70aba714-f4e5-4d6d-8d2a-6a27d1ecbaa0",
        "clientId": "web-app",
        "status": "COMPLETED",
        "startTime": "2026-11-13T17:00:00.000Z",
        "endTime": "2026-11-13T18:00:00.000Z",
        "actualDurationSeconds": 3000,
        "totalBreakSeconds": 600,
        "completedTasksCount": 2,
        "notes": "Projectile motion drill",
        "createdAt": "2026-11-13T02:37:39.855Z",
        "updatedAt": "2026-11-13T02:37:39.855Z",
        "subject": {
          "id": "03b07fe9-5a9d-4962-9f0d-42a192c2f48d",
          "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
          "academicYearId": null,
          "classId": null,
          "name": "Physics",
          "code": "PHY",
          "colorHex": "#2563EB",
          "icon": "atom",
          "targetWeeklyMinutes": 240,
          "isArchived": false,
          "createdAt": "2026-11-13T02:37:19.783Z",
          "updatedAt": "2026-11-13T02:37:19.783Z"
        },
        "topic": {
          "id": "70aba714-f4e5-4d6d-8d2a-6a27d1ecbaa0",
          "chapterId": "9f03644a-ccc3-4761-94ad-9f376a688583",
          "title": "Scalars vs Vectors",
          "orderIndex": 1,
          "contentSummary": null,
          "difficultyLevel": 2,
          "estimatedMinutes": 40,
          "createdAt": "2026-11-13T02:37:19.783Z",
          "updatedAt": "2026-11-13T02:37:19.783Z"
        },
        "breaks": [
          {
            "id": "e2915468-3e64-4ee1-b281-87cd7e592a0f",
            "studySessionId": "b34f6a5a-53d7-47b3-886b-6b2ed41bbd31",
            "breakStart": "2026-11-13T17:25:00.000Z",
            "breakEnd": "2026-11-13T17:35:00.000Z",
            "durationSeconds": 600
          }
        ]
      }
    ],
    "dailyStats": [
      {
        "id": "e31bb4f7-85ca-479b-b4ac-122038c7388d",
        "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
        "statDate": "2026-11-12T00:00:00.000Z",
        "totalStudySeconds": 4680,
        "totalBreakSeconds": 540,
        "sessionsCompleted": 2,
        "tasksCompleted": 1,
        "streakDays": 1,
        "updatedAt": "2026-11-13T02:37:38.498Z"
      }
    ]
  },
  "meta": {}
}
```

**Empty state — 200:** `{"sessions":[],"dailyStats":[]}`

- Session `events` are not included.
- No pagination. `actualDurationSeconds` is net study time (breaks excluded).
- `subject`/`topic`/`break` are `null`/`[]` when not set.

---

## 7. Notifications

### 7.1 `GET /notifications`

Latest **50**, newest first. **No pagination, no `unreadOnly`, no unread-count field, no total.**

**200:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": "d81d6ac3-b1cc-4f11-9aff-818e5900ba4a",
      "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
      "category": "ASSIGNMENT_REMINDER",
      "title": "Assignment due in 3 days",
      "body": "Kinematics Problem Set 3 is due on Friday at 11:00 PM.",
      "actionUrl": "/assignments",
      "isRead": false,
      "readAt": null,
      "createdAt": "2026-11-13T01:53:03.699Z"
    },
    {
      "id": "7e08e75a-0eee-4861-b20d-a86ef7565ea7",
      "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
      "category": "REVISION_REMINDER",
      "title": "Revision due tomorrow",
      "body": "Friction is scheduled for revision tomorrow at 9:00 AM.",
      "actionUrl": "/revisions",
      "isRead": false,
      "readAt": null,
      "createdAt": "2026-11-12T23:38:03.699Z"
    },
    {
      "id": "88f10e9b-7b12-4570-97c3-34c0e40a2091",
      "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
      "category": "ACHIEVEMENT",
      "title": "5-day streak unlocked",
      "body": "You studied 5 days in a row. Keep it going!",
      "actionUrl": "/achievements",
      "isRead": true,
      "readAt": "2026-11-12T06:38:03.699Z",
      "createdAt": "2026-11-12T02:38:03.699Z"
    },
    {
      "id": "d2208375-149c-42ac-a83e-03cbbf77a266",
      "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
      "category": "SYSTEM",
      "title": "Welcome to StudyPilot",
      "body": "Your account is verified and ready.",
      "actionUrl": null,
      "isRead": true,
      "readAt": "2026-10-15T02:38:03.699Z",
      "createdAt": "2026-10-14T02:38:03.699Z"
    }
  ],
  "meta": {}
}
```

**Empty state — 200:** `data: []`

**Unread count:** there is no endpoint and no field. Compute `data.filter(n => !n.isRead).length` — correct only within the latest 50 notifications. Keep a local unread counter if you need exactness (see §9).

**Categories:** `ASSIGNMENT_REMINDER`, `EXAM_REMINDER`, `REVISION_REMINDER`, `STUDY_PLAN_REMINDER`, `ACHIEVEMENT`, `REWARD`, `SECURITY`, `SYSTEM`.

### 7.2 `PATCH /notifications/:id/read` → **200**

Idempotent: calling it again returns 200 with the same body.

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "d81d6ac3-b1cc-4f11-9aff-818e5900ba4a",
    "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
    "category": "ASSIGNMENT_REMINDER",
    "title": "Assignment due in 3 days",
    "body": "Kinematics Problem Set 3 is due on Friday at 11:00 PM.",
    "actionUrl": "/assignments",
    "isRead": true,
    "readAt": "2026-11-13T02:41:22.168Z",
    "createdAt": "2026-11-13T01:53:03.699Z"
  },
  "meta": {}
}
```

Errors:

```json
{
  "success": false,
  "message": "Notification not found",
  "error": { "code": "NOTIFICATION_NOT_FOUND", "details": [] }
}
```
→ **404**

```json
{
  "success": false,
  "message": "Access denied: you do not own this notification",
  "error": { "code": "NOTIFICATION_OWNERSHIP_VIOLATION", "details": [] }
}
```
→ **403** (a real other-user notification id was used)

> A malformed non-UUID id also produces a 500-class Prisma error path — always send the UUID you received.

### 7.3 `POST /notifications/read-all` → **201**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { "markedReadCount": 1 },
  "meta": {}
}
```

Second call (nothing unread) → **201** with `{"markedReadCount":0}`. After this, `GET /notifications` shows all rows `isRead: true` with `readAt` set.

### 7.4 Preferences

- `GET /notifications/preferences` → **200**, array of `{id, userId, category, inAppEnabled, emailEnabled, pushEnabled, updatedAt}` (empty array by default; rows are created on first PATCH).
- `PATCH /notifications/preferences` → **200**, body `{category, inAppEnabled?, emailEnabled?, pushEnabled?}`; omitted flags default to `true`/`true`/`false` on first insert.

---

## 8. Subscription & AI Quota

### 8.1 `GET /subscriptions/me`

Returns the **latest subscription by `createdAt`** with `plan` + `invoices`, regardless of status. Returns `{}` when the user has never subscribed.

**Active subscription — 200:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "ff9d4b8c-9e6e-417d-8fee-a6e905850e9a",
    "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
    "planId": "0117bf91-b5bc-4bda-ae37-da2fe2223e4c",
    "status": "ACTIVE",
    "externalSubscriptionId": "sub_module2_1794537735646",
    "currentPeriodStart": "2026-11-08T02:42:15.646Z",
    "currentPeriodEnd": "2026-12-08T02:42:15.646Z",
    "cancelAtPeriodEnd": false,
    "cancelledAt": null,
    "createdAt": "2026-11-13T02:42:15.648Z",
    "updatedAt": "2026-11-13T02:42:15.648Z",
    "plan": {
      "id": "0117bf91-b5bc-4bda-ae37-da2fe2223e4c",
      "code": "MODULE2_PRO_MONTHLY",
      "name": "StudyPilot Pro — Monthly",
      "priceCents": 999,
      "currency": "USD",
      "billingInterval": "MONTHLY",
      "dailyAiTokenLimit": 200000,
      "storageQuotaBytes": 10737418240,
      "features": {
        "aiChat": true,
        "storageGb": 10,
        "offlineSync": true,
        "aiDailyTokens": 200000,
        "prioritySupport": true,
        "advancedAnalytics": true
      },
      "isActive": true,
      "createdAt": "2026-11-13T02:42:12.450Z"
    },
    "invoices": [
      {
        "id": "e891be3a-6f71-4024-bc7e-c80efa83ecc5",
        "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
        "subscriptionId": "ff9d4b8c-9e6e-417d-8fee-a6e905850e9a",
        "invoiceNumber": "INV-MODULE2-1794537735646",
        "amountDueCents": 999,
        "amountPaidCents": 999,
        "status": "PAID",
        "issuedAt": "2026-11-08T02:42:15.646Z"
      }
    ]
  },
  "meta": {}
}
```

**No subscription — 200:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {}
}
```

Rules:
- `{}` means "no subscription row", **not** "free plan object". Treat missing/empty `data` as `FREE_TIER`.
- Statuses: `ACTIVE`, `TRIALING`, `PAST_DUE`, `CANCELLED`, `EXPIRED`. This endpoint does **not** filter on status or `currentPeriodEnd`, so it can return an expired/cancelled subscription. Gating must decide: `status === 'ACTIVE' && new Date(currentPeriodEnd) > now`.
- **There is no entitlements array.** Feature flags live in `plan.features` (free-form JSON); `dailyAiTokenLimit` and `storageQuotaBytes` are top-level columns.
- `storageQuotaBytes` is serialized as a **number** (BigInt converted in the response interceptor). 10 GB = `10737418240`.
- `billingInterval` values today: `MONTHLY` (seeded data used `MONTHLY`).
- `invoices` is always an array (may be empty).

### 8.2 `GET /subscriptions/plans` — public

Returns **active** plans ordered by `priceCents ASC`. No auth required. The live table is currently **empty** (no seed), so today it returns `data: []`. Sample from a temporary plan created for verification:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": "0117bf91-b5bc-4bda-ae37-da2fe2223e4c",
      "code": "MODULE2_PRO_MONTHLY",
      "name": "StudyPilot Pro — Monthly",
      "priceCents": 999,
      "currency": "USD",
      "billingInterval": "MONTHLY",
      "dailyAiTokenLimit": 200000,
      "storageQuotaBytes": 10737418240,
      "features": {
        "aiChat": true,
        "storageGb": 10,
        "offlineSync": true,
        "aiDailyTokens": 200000,
        "prioritySupport": true,
        "advancedAnalytics": true
      },
      "isActive": true,
      "createdAt": "2026-11-13T02:42:12.450Z"
    }
  ],
  "meta": {}
}
```

Empty state: `data: []` (this is what you get against the current database).

> The frontend must handle an empty catalog gracefully — the paywall cannot be shown from this endpoint until plans are seeded.

### 8.3 `GET /ai/usage` — **20 requests/min**

Returns the daily quota and the newest **30** usage logs. Counts only `isSuccess: true` logs created since **00:00 UTC**.

**Free tier — 200:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "quota": {
      "dailyLimit": 25000,
      "usedToday": 1200,
      "remainingTokens": 23800,
      "planCode": "FREE_TIER"
    },
    "recentLogs": [
      {
        "id": "6c45e07d-7dc6-4149-9463-3b375bf1cc34",
        "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
        "feature": "AI_CHAT",
        "provider": "gemini",
        "model": "gemini-2.5-flash",
        "promptTokens": 700,
        "completionTokens": 500,
        "totalTokens": 1200,
        "latencyMs": 1840,
        "isFallback": false,
        "isSuccess": true,
        "errorCode": null,
        "createdAt": "2026-11-13T02:08:05.043Z"
      },
      {
        "id": "4b5e958b-da8f-4c2a-b420-c6c706d2526b",
        "userId": "70e1d0c7-112d-4547-8886-038ab80fd1c8",
        "feature": "EXPLAIN_TOPIC",
        "provider": "gemini",
        "model": "gemini-2.5-flash",
        "promptTokens": 0,
        "completionTokens": 0,
        "totalTokens": 0,
        "latencyMs": 0,
        "isFallback": false,
        "isSuccess": false,
        "errorCode": "PRIMARY_PROVIDER_ERROR",
        "createdAt": "2026-11-12T20:38:05.043Z"
      }
    ]
  },
  "meta": {}
}
```

**With an ACTIVE paid plan — 200:** `dailyLimit` comes from `plan.dailyAiTokenLimit` and `planCode` is the plan code:

```json
{
  "quota": {
    "dailyLimit": 200000,
    "usedToday": 1200,
    "remainingTokens": 198800,
    "planCode": "MODULE2_PRO_MONTHLY"
  }
}
```

**Quota exhausted — 200 (not 403):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "quota": {
      "dailyLimit": 25000,
      "usedToday": 25000,
      "remainingTokens": 0,
      "planCode": "FREE_TIER",
      "quotaReached": true
    },
    "recentLogs": [ ... ]
  },
  "meta": {}
}
```

- `quotaReached` appears **only** when the quota is exhausted.
- ⚠️ When exhausted, the endpoint's error fallback **hard-codes `planCode: "FREE_TIER"` and `dailyLimit: 25000`**, even if the user has a paid plan. Do not use `planCode` from an exhausted response to decide the paywall tier — use `/subscriptions/me`.
- Other AI routes (`POST /ai/chat`, `/ai/generate-study-plan`, `/ai/summarize`, `/ai/explain-topic`) throw **403 `AI_QUOTA_EXCEEDED`** when exhausted:

```json
{
  "success": false,
  "message": "Daily AI token usage limit reached for your current subscription tier",
  "error": { "code": "AI_QUOTA_EXCEEDED", "details": [] }
}
```

- `FREE_TIER` limit = `AI_FREE_DAILY_TOKEN_LIMIT` env (25000 default).
- `recentLogs` includes failures (`isSuccess: false`) with `errorCode`; failed logs do not consume quota.
- Quota resets at **00:00 UTC**, not local midnight.

### 8.4 Checkout — `POST /subscriptions/checkout`

Body `{planCode, idempotencyKey}`. Success **201** with `{checkoutSessionId, checkoutUrl, transaction, plan}`. `checkoutUrl` is a placeholder `https://checkout.studypilot.io/pay/<id>`; there is **no real Stripe integration** — assigning a plan requires the signed webhook (`POST /payments/webhook`) or DB seeding. Unknown/inactive plan → **404 `PLAN_NOT_FOUND`**.

---

## 9. Error Contract

Envelope for every non-2xx:

```json
{
  "success": false,
  "message": "Human-readable message",
  "error": { "code": "MACHINE_CODE", "details": [] }
}
```

### 400 — parameter/validation (fields, unknown keys, bad ranges)

```json
{
  "success": false,
  "message": "Validation failed for one or more fields",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "dailyStudyTargetMinutes", "messages": ["dailyStudyTargetMinutes must not be less than 15"] }
    ]
  }
}
```

Unknown property: `{"field":"foo","messages":["property foo should not exist"]}` (`forbidNonWhitelisted`).

### 401 — missing / malformed / expired token

```json
{
  "success": false,
  "message": "Authentication token is required",
  "error": { "code": "MISSING_AUTH_TOKEN", "details": [] }
}
```

```json
{
  "success": false,
  "message": "Malformed JWT token",
  "error": { "code": "INVALID_TOKEN", "details": [] }
}
```

Other codes: `TOKEN_EXPIRED`, `SESSION_REVOKED`.

### 403 — ownership, suspension, quota

```json
{
  "success": false,
  "message": "Access denied: you do not own this notification",
  "error": { "code": "NOTIFICATION_OWNERSHIP_VIOLATION", "details": [] }
}
```

Also: `PLAN_OWNERSHIP_VIOLATION` (`/planner`), `ACCOUNT_SUSPENDED`, `AI_QUOTA_EXCEEDED`, `FORBIDDEN_ROLE` (admin only).

### 404 — unknown resource

```json
{
  "success": false,
  "message": "Notification not found",
  "error": { "code": "NOTIFICATION_NOT_FOUND", "details": [] }
}
```

Also: `PLAN_NOT_FOUND` (checkout and planner), `USER_NOT_FOUND`, `PROFILE_NOT_FOUND`.

### 429 — throttled

```json
{
  "success": false,
  "message": "ThrottlerException: Too Many Requests",
  "error": { "code": "RATE_LIMIT_EXCEEDED", "details": [] }
}
```

Headers: `Retry-After: 60`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

Limits (verified from `@nestjs/throttler` internals): **100 requests / 60 s / IP per route handler**, not one shared budget. Each handler gets its own bucket (the throttle key is `Controller-handler-name-IP`), so exhausting `GET /analytics/overview` does not consume the budget of `GET /notifications`. **20 requests / 60 s / IP per handler** for **all** `/ai/*` including `GET /ai/usage`, and **10 requests / 60 s / IP** for the auth POSTs (`register`, `login`, `refresh`, `forgot-password`, `reset-password`, `verify-email`, `resend-verification`). Limiter state is **in-memory**, not shared across instances, and there is no per-user bucket.

### 500 — unhandled

```json
{
  "success": false,
  "message": "Request could not be processed",
  "error": { "code": "INTERNAL_SERVER_ERROR", "details": [] }
}
```

No stack traces are returned.

---

## 10. Gating Rules (FREE_TIER vs Pro)

The backend enforces **only AI quota**. No analytics, planner, notification, subject or study-session endpoint is plan-gated — a free user gets the full dashboard.

| Capability | Enforcement | Where to read it |
|---|---|---|
| AI tokens/day | ✅ hard block on AI calls when exhausted | `GET /ai/usage` → `quota.dailyLimit/remainingTokens` |
| Paid plan detection | No boolean/entitlements field | `/subscriptions/me` → `status + currentPeriodEnd + plan.code` |
| Feature flags | Not enforced server-side | `plan.features` JSON (client-side gates only) |
| Storage quota | Column exists, not enforced by any endpoint | `plan.storageQuotaBytes` |
| Advanced analytics | Not enforced | `plan.features.advancedAnalytics` |

Recommended gating logic:

```
isPro = sub.status === 'ACTIVE' && new Date(sub.currentPeriodEnd) > now
aiQuotaExhausted = usage.quota.remainingTokens <= 0
```

Never key off `usage.quota.planCode === 'FREE_TIER'` when `quotaReached` is present.

---

## 11. Empty-State Matrix (brand-new verified student)

| Endpoint | Empty response |
|---|---|
| `/analytics/overview` | all counters `0`, `upcomingDeadlines: []`, `upcomingExams: []`, `gamification` zeros |
| `/analytics/study-time` | `{totalMinutesLast30Days: 0, dailyBreakdown: []}` |
| `/analytics/subject-progress` | `[]` |
| `/analytics/weekly-report` | zeros as shown in §3.4 |
| `/subjects` | `[]` |
| `/planner` | `[]` |
| `/revisions/upcoming` | `[]` |
| `/revisions` | `[]` |
| `/study-sessions/history` | `{sessions: [], dailyStats: []}` |
| `/notifications` | `[]` |
| `/notifications/preferences` | `[]` |
| `/subscriptions/me` | `{}` |
| `/ai/usage` | `quota: {dailyLimit: 25000, usedToday: 0, remainingTokens: 25000, planCode: "FREE_TIER"}`, `recentLogs: []` |
| `/users/me` | normal object, `points` all zeros, `profile` present |
| `/users/me/settings` | normal object with defaults `120 / 840 / 25 / 5` |
| `/rewards/history` | `{transactions: [], redemptions: []}` |

---

## 12. Recommended Dashboard Composition

Call these **in parallel** on mount (total latency is dominated by the slowest call — measured 2–12 s per endpoint against the Supabase pooler, so use a **≥ 60 s client timeout**):

```
GET /users/me                  -> profile, points.currentStreakDays/longestStreakDays
GET /users/me/settings         -> dailyStudyTargetMinutes (goal target)
GET /analytics/overview        -> totals, deadlines, exams, gamification
GET /analytics/study-time      -> 30-day chart + today's minutes (UTC)
GET /analytics/subject-progress-> subject cards
GET /planner                   -> today's tasks (filter scheduledDate == today UTC)
GET /revisions/upcoming        -> due revisions
GET /notifications             -> feed + unread computed client-side
GET /study-sessions/history    -> recent sessions ("Recent Activity")
GET /subscriptions/me          -> plan/status
GET /ai/usage                  -> quota meter (20/min budget!)
```

Mapping:

| UI block | Source | Field |
|---|---|---|
| Focus target today | settings | `dailyStudyTargetMinutes` |
| Focus achieved today | study-time | `dailyBreakdown.find(d => d.date === today).studyMinutes` (missing → `0`) |
| Study streak | users/me | `points.currentStreakDays` (⚠️ see §4.1) |
| Longest streak | users/me | `points.longestStreakDays` |
| Total / week minutes | overview | `totalStudyMinutes`, `weeklyStudyMinutes` |
| Completed sessions | overview | `totalSessionsCompleted` |
| Assignment completion | overview | `assignmentCompletionRate` |
| Subject cards | subject-progress | `subject.name`, `subject.colorHex`, `subject.icon`, `completedChapters/totalChapters`, `completionPercentage` |
| Scheduled tasks today | planner | `tasks.filter(t => sameUtcDay(t.scheduledDate))` |
| Due revisions | revisions/upcoming | `scheduledFor`, `revisionTopic.topic.title` |
| Unread badge | notifications | `data.filter(n => !n.isRead).length` |
| Recent activity | study-sessions/history | `sessions[]` (newest first) |
| Plan badge | subscriptions/me | `plan.code` / `status` |
| AI quota meter | ai/usage | `quota.remainingTokens / quota.dailyLimit` |

**Time zone:** the backend is UTC-only. `statDate` and the planner's "today" are UTC dates; a Dhaka (UTC+6) user's local day starts at 06:00 local. Compute "today's minutes" with the same UTC date you send, and clearly label the chart. Do not send `X-Timezone`; it is rejected by CORS and ignored.

---

## 13. Offline Caching Rules

- No `Cache-Control`; `ETag` exists but is regenerated per response and must not be relied on. Cache deliberately.
- Cache on success and serve stale on network failure:
  - `/users/me`, `/users/me/settings`, `/subjects`, `/analytics/subject-progress`, `/subscriptions/plans`, `/subscriptions/me` — TTL 15 min.
  - `/analytics/overview`, `/analytics/study-time`, `/analytics/weekly-report` — TTL 5 min; refresh on pull-to-refresh/app foreground.
  - `/planner`, `/revisions/upcoming`, `/study-sessions/history`, `/notifications` — TTL 1–5 min.
  - `/ai/usage` — TTL 1 min, and **do not auto-poll** (20/min limit).
- Persist `notifications` with `isRead` so the unread badge survives offline. Apply optimistic read state locally, then reconcile `markedReadCount` on reconnect; if it differs, re-fetch.
- On any `401`, clear cached dashboard data and go through Module 1 refresh/logout. On `403 ACCOUNT_SUSPENDED`, wipe caches.
- Offline mutations (`PATCH /users/me/settings`, mark-read) should queue and replay; both are idempotent.
- A "brand-new user" onboarding state should trigger when `subjects=[] && overview.totalSessionsCompleted=0` (do not use `subscriptions/me = {}` alone — free users also have no subscription).

---

## 14. Verified Gaps / Blockers (what the frontend must not assume)

1. **No `/dashboard` aggregate endpoint** — 11 calls needed; run them in parallel.
2. **Streak is never updated by the backend.** `currentStreakDays`/`longestStreakDays` stay `0` for real users. The sample values were seeded.
3. **`completedTopics` is never incremented**; subject progress is chapter-based.
4. **Notifications: latest 50 only**, no pagination/filter/unread-count/total.
5. **No user-facing activity feed.** Use notifications + session history + rewards ledger.
6. **No `StudyGoal` API**; only `StudyGoal` all-time count appears in the weekly report.
7. **Study-time series is sparse** (no zero-filled days).
8. **`weeklyStudyMinutes` / `revisionsCompletedThisWeek` are rolling 7 days**, not calendar weeks.
9. **Decimal fields are strings** (`"50"`, `"2.5"`, `"35"`); parse before arithmetic.
10. **`overview.assignmentCompletionRate` excludes `GRADED`**, while the weekly report includes it — numbers can disagree.
11. **`/planner` mutates data on GET** (marks past-due tasks `MISSED`).
12. **`/notifications/read-all` returns 201**, not 200.
13. **`/subscriptions/me` can return an expired subscription** — check `status` + `currentPeriodEnd`.
14. **No entitlements array**; use `plan.features` / `dailyAiTokenLimit`.
15. **`/subscriptions/plans` is empty in the live DB** — no plans seeded, so the paywall catalog is blank today.
16. **Paid-plan quota-exhausted `/ai/usage` mislabels `planCode` as `FREE_TIER`** (hard-coded fallback).
17. **No timezone support** — everything is UTC.
18. **`PATCH /notifications/:id/read` with a non-UUID id** can surface a 500 instead of 400; only send server-issued UUIDs.
19. **API latency**: 2–12 s per call on the Supabase pooler; client timeout ≥ 60 s, and expect registration/login (awaited SMTP) to take 17–32 s.
20. **Rate limiting is per-IP, per-route and in-memory**; a dashboard burst of 11 calls at once is fine (each route has its own 100/min bucket) but `/ai/usage` counts against that route's 20/min.

### Fix applied during this verification

`src/common/utils/redaction.util.ts` — Prisma `BigInt` columns (`storageQuotaBytes`) are now converted to `number` during response redaction. Without this, `JSON.stringify` throws and both `/subscriptions/plans` and `/subscriptions/me` would return **500** as soon as a plan is seeded. Verified live: `10737418240` is returned as a JSON number.
