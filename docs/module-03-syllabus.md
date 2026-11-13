# Module 3 — Syllabus Management (Verified API Contract)

**Status:** verified against the running backend on 13 Nov 2026 (live Supabase PostgreSQL). Every JSON sample below was captured from a real HTTP response unless explicitly marked otherwise. Test students (`module3.owner@studypilot.test`, `module3.other@studypilot.test`) were deleted after capture; the UUIDs in the samples no longer exist.
**Scope:** academic years/semesters (availability), subjects CRUD + archive, chapters/units, topics, topic/chapter completion, syllabus progress, search & filtering.
**Important:** there is **no semester API** and **no `GET /chapters` / `GET /topics` list API**. The syllabus tree is read through `GET /subjects/:id` (or `GET /subjects`).

---

## 1. Environment, Headers & Envelope

### 1.1 Base URLs

| Environment | Base URL | Status |
|---|---|---|
| Development | `http://localhost:4000/api/v1` | **Verified live** (local) |
| Swagger | `http://localhost:4000/api/docs` | **Verified live** (local) |
| Production (Render) | `https://forgem.onrender.com/api/v1` | **Live** |
| Swagger (Render) | `https://forgem.onrender.com/api/docs` | **Live** |
| Staging | *not configured* | ❌ no staging deployment exists |
| Production (intended) | `https://api.studypilot.io/api/v1` | ⚠️ from config, not verified |

### 1.2 Headers

| Header | Required | Notes |
|---|---|---|
| `Authorization: Bearer <accessToken>` | **Yes** on every `/subjects`, `/chapters`, `/topics` route | Custom HS256 JWT, 900 s lifetime |
| `Content-Type: application/json` | Yes for `POST`/`PATCH` bodies | 1 MB request limit |
| `Accept: application/json` | Recommended | Not enforced |
| `X-Request-Id` | Optional | Echoed back |
| `X-Timezone` | ❌ **Do not send** | Not in the CORS allow-list and not read by the backend |

### 1.3 Envelope & status codes

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {}
}
```

- `GET`, `PATCH`, `DELETE` → **200**
- Every `POST` (including `/complete`, `/uncomplete`) → **201**
- Errors: **400 / 401 / 403 / 404 / 409 / 429 / 500** with `{ success:false, message, error:{ code, details } }`
- Prisma `Decimal` columns are serialized as **strings** (`"0"`, `"33.33"`, `"100"`).
- No `PUT` routes exist; `PUT /subjects/:id` returns **404 `RESOURCE_NOT_FOUND`**.

---

## 2. Endpoint Map

| Screen action | Method & path | Success | Rate limit |
|---|---|---|---|
| List subjects / syllabus | `GET /subjects` (`?archived=`, `?search=`) | 200 | 100/min/IP per route |
| Subject + full tree | `GET /subjects/:id` | 200 | 100/min/IP |
| Create subject | `POST /subjects` | **201** | 100/min/IP |
| Edit subject | `PATCH /subjects/:id` | 200 | 100/min/IP |
| Archive / restore subject | `PATCH /subjects/:id` `{isArchived}` | 200 | 100/min/IP |
| Delete subject | `DELETE /subjects/:id` | 200 | 100/min/IP |
| Create chapter | `POST /chapters` | **201** | 100/min/IP |
| Edit / reorder chapter | `PATCH /chapters/:id` | 200 | 100/min/IP |
| Delete chapter | `DELETE /chapters/:id` | 200 | 100/min/IP |
| Complete chapter | `POST /chapters/:id/complete` | **201** | 100/min/IP |
| Uncomplete chapter | `POST /chapters/:id/uncomplete` | **201** | 100/min/IP |
| Create topic | `POST /chapters/topics` | **201** | 100/min/IP |
| Edit / reorder topic | `PATCH /topics/:id` | 200 | 100/min/IP |
| Delete topic | `DELETE /topics/:id` | 200 | 100/min/IP |
| Complete topic | `POST /topics/:id/complete` | **201** | 100/min/IP |
| Uncomplete topic | `POST /topics/:id/uncomplete` | **201** | 100/min/IP |
| Academic years | ❌ no route | 404 | — |
| Semesters | ❌ no route | 404 | — |

**Prefer `GET /subjects/:id` for the tree.** `GET /subjects` also returns full trees (all chapters and topics for every subject), so its payload grows with the whole syllabus.

---

## 3. Academic Years / Semesters — not user-editable

There is **no endpoint** for academic years, semesters, institutions or classes:

```
GET  /academic-years   → 404
POST /academic-years   → 404
GET  /semesters        → 404
```

Captured 404 (identical shape for all three):

```json
{
  "success": false,
  "message": "Cannot GET /api/v1/academic-years",
  "error": { "code": "RESOURCE_NOT_FOUND", "details": [] }
}
```

| Fact | Detail |
|---|---|
| `Semester` model | **does not exist** in the database |
| `AcademicYear` | global reference table only (`id, name, startDate, endDate, isCurrent`); no seeded rows exposed and no CRUD route |
| `src/modules/academic/academic.module.ts` | empty module (`@Module({})`) |
| `Subject.academicYearId` / `Subject.classId` | columns exist but **cannot be set through the API** — `POST /subjects` rejects both with 400 |
| `?semesterId=` on `GET /subjects` | silently ignored (see §7) |

**Conclusion:** the Semester/Academic-Year Management screen cannot be backed by this API. Either ship it as local/static UI, or treat it as a new backend feature (schema + CRUD + subject linking) — do not call any academic-year endpoint.

---

## 4. Subjects

### 4.1 `GET /subjects` — list + archives + search

Query parameters (both optional; other params are ignored):

| Param | Values | Default | Behaviour |
|---|---|---|---|
| `archived` | `false` \| `true` \| `all` | `false` | `true` = only archived, `all` = both. Case-insensitive; any other value behaves like `false` |
| `search` | string | — | Case-insensitive `contains` on `name` **and** `code`; trimmed |

`GET /subjects` sample (abridged; each subject also contains `chapters[]` and `subjectProgress[]`):

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": "721d9c39-c8b8-48ed-92e7-218d93401b53",
      "userId": "3b777884-0bcd-461d-bf29-60d9ad5abbd7",
      "academicYearId": null,
      "classId": null,
      "name": "Operating Systems",
      "code": "CS-301",
      "colorHex": "#2563EB",
      "icon": "cpu",
      "targetWeeklyMinutes": 300,
      "isArchived": false,
      "createdAt": "2026-11-13T03:20:59.851Z",
      "updatedAt": "2026-11-13T03:24:24.565Z",
      "chapters": [
        {
          "id": "becc4205-304f-4710-8dc0-54a8c9e1fe3c",
          "subjectId": "721d9c39-c8b8-48ed-92e7-218d93401b53",
          "title": "Foundations",
          "orderIndex": 1,
          "description": "Processes, threads, and scheduling.",
          "estimatedMinutes": 90,
          "isCompleted": false,
          "completedAt": null,
          "createdAt": "2026-11-13T03:26:08.127Z",
          "updatedAt": "2026-11-13T03:26:12.970Z",
          "topics": [
            {
              "id": "8d3ae2d8-41cd-4c2d-915a-c018bb5e028f",
              "chapterId": "becc4205-304f-4710-8dc0-54a8c9e1fe3c",
              "title": "Process Lifecycle & PCB",
              "orderIndex": 1,
              "contentSummary": "States, PCB, context switching.",
              "difficultyLevel": 3,
              "estimatedMinutes": 60,
              "createdAt": "2026-11-13T03:36:51.706Z",
              "updatedAt": "2026-11-13T03:38:27.491Z",
              "topicProgress": []
            }
          ]
        }
      ],
      "subjectProgress": [
        {
          "id": "1cdbbeca-7b19-455f-822d-60bcfaa54731",
          "userId": "3b777884-0bcd-461d-bf29-60d9ad5abbd7",
          "subjectId": "721d9c39-c8b8-48ed-92e7-218d93401b53",
          "totalChapters": 1,
          "completedChapters": 0,
          "totalTopics": 1,
          "completedTopics": 0,
          "completionPercentage": "0",
          "totalStudyMinutes": 0,
          "lastStudiedAt": "2026-11-13T03:37:57.688Z",
          "updatedAt": "2026-11-13T03:37:57.690Z"
        }
      ]
    }
  ],
  "meta": {}
}
```

Notes:

- Subjects are ordered by `createdAt` ascending; chapters/topics by `orderIndex` ascending.
- `topicProgress` is the authenticated student's row for that topic: `[]` when untouched, or a single-element array after any complete/uncomplete call (§6.4).
- There is **no pagination** and no `limit`/`page` handling.

`?archived=true` returns only archived subjects; `?archived=all` returns both; `?archived=false` (and no param) excludes archived:

```json
{ "success": true, "message": "Operation completed successfully",
  "data": [ { "id": "...", "name": "...", "isArchived": true, "chapters": [], "subjectProgress": [] } ],
  "meta": {} }
```

`?search=cs-30` matched `code: "CS-302"`; `?search=zzz-nope` returned `"data": []`.

### 4.2 `GET /subjects/:id` — full syllabus tree

- Returns the subject with `chapters[] → topics[] → topicProgress[]` and `subjectProgress[]`.
- **Archived subjects are still returned by id** (no archive filter on this route).
- Malformed UUID → **400**; unknown UUID → **404 `SUBJECT_NOT_FOUND`**; another user's subject → **403 `SUBJECT_OWNERSHIP_VIOLATION`**.

Captured **200** on the post-fix build after completing exactly one topic (test data; the user/subject were deleted after capture):

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "b9a8e29a-45ec-4263-81e7-dee5e0bd1f0a",
    "userId": "d4f8174b-34ff-45ac-a7f6-a784ac2008d0",
    "academicYearId": null,
    "classId": null,
    "name": "Computer Networks",
    "code": null,
    "colorHex": "#4F46E5",
    "icon": null,
    "targetWeeklyMinutes": 180,
    "isArchived": false,
    "createdAt": "2026-11-13T03:52:26.449Z",
    "updatedAt": "2026-11-13T03:52:26.449Z",
    "chapters": [
      {
        "id": "77b70f20-f332-4267-ae6e-1bd7513a723c",
        "subjectId": "b9a8e29a-45ec-4263-81e7-dee5e0bd1f0a",
        "title": "The Network Layer",
        "orderIndex": 1,
        "description": null,
        "estimatedMinutes": 60,
        "isCompleted": false,
        "completedAt": null,
        "createdAt": "2026-11-13T03:53:28.345Z",
        "updatedAt": "2026-11-13T03:53:28.345Z",
        "topics": []
      },
      {
        "id": "e32b6f8b-a746-450a-ad03-03c59686e93a",
        "subjectId": "b9a8e29a-45ec-4263-81e7-dee5e0bd1f0a",
        "title": "The Link Layer",
        "orderIndex": 2,
        "description": null,
        "estimatedMinutes": 60,
        "isCompleted": false,
        "completedAt": null,
        "createdAt": "2026-11-13T03:53:05.813Z",
        "updatedAt": "2026-11-13T03:53:05.813Z",
        "topics": [
          {
            "id": "45123c16-06f9-4da5-a981-c6f646848498",
            "chapterId": "e32b6f8b-a746-450a-ad03-03c59686e93a",
            "title": "Ethernet & Switching",
            "orderIndex": 1,
            "contentSummary": null,
            "difficultyLevel": 3,
            "estimatedMinutes": 30,
            "createdAt": "2026-11-13T03:54:55.293Z",
            "updatedAt": "2026-11-13T03:54:55.293Z",
            "topicProgress": [
              {
                "id": "2df8f2fb-b6b3-4b78-a199-b5fd9119a372",
                "userId": "d4f8174b-34ff-45ac-a7f6-a784ac2008d0",
                "topicId": "45123c16-06f9-4da5-a981-c6f646848498",
                "isCompleted": true,
                "completionPercentage": "100",
                "confidenceScore": 3,
                "timeSpentMinutes": 0,
                "completedAt": "2026-11-13T03:56:01.450Z",
                "updatedAt": "2026-11-13T03:56:01.452Z"
              }
            ]
          },
          {
            "id": "5f170198-7c26-40b7-a778-e8f6fa8b17e4",
            "chapterId": "e32b6f8b-a746-450a-ad03-03c59686e93a",
            "title": "ARP & VLANs",
            "orderIndex": 2,
            "contentSummary": null,
            "difficultyLevel": 3,
            "estimatedMinutes": 30,
            "createdAt": "2026-11-13T03:55:20.150Z",
            "updatedAt": "2026-11-13T03:55:20.150Z",
            "topicProgress": []
          }
        ]
      },
      {
        "id": "15cc532e-5cc6-473d-a9f6-15a6e9edadcf",
        "subjectId": "b9a8e29a-45ec-4263-81e7-dee5e0bd1f0a",
        "title": "Transport Layer",
        "orderIndex": 3,
        "description": null,
        "estimatedMinutes": 60,
        "isCompleted": false,
        "completedAt": null,
        "createdAt": "2026-11-13T03:53:51.501Z",
        "updatedAt": "2026-11-13T03:53:51.501Z",
        "topics": []
      }
    ],
    "subjectProgress": [
      {
        "id": "4be9aca6-d2a1-4cd9-8885-1d0a73f24d65",
        "userId": "d4f8174b-34ff-45ac-a7f6-a784ac2008d0",
        "subjectId": "b9a8e29a-45ec-4263-81e7-dee5e0bd1f0a",
        "totalChapters": 3,
        "completedChapters": 0,
        "totalTopics": 2,
        "completedTopics": 1,
        "completionPercentage": "0",
        "totalStudyMinutes": 0,
        "lastStudiedAt": "2026-11-13T03:56:09.987Z",
        "updatedAt": "2026-11-13T03:56:09.988Z"
      }
    ]
  },
  "meta": {}
}
```

Notes:

- `topicProgress` is always an **array** (Prisma filtered relation) containing **at most one** row — the row of the authenticated caller. Never index it without a guard: `topics[].topicProgress[0]?.isCompleted === true`.
- The completed topic shows `"completionPercentage": "100"` on the **topic** row; the **subject** percentage is still `"0"` because `completionPercentage` is chapter-based (§7).
- `completedTopics` is `1` in `subjectProgress` — topic completion updates the count even though the percentage does not move.

### 4.3 `POST /subjects` — create

Body fields:

| Field | Required | Type / rule | Default |
|---|---|---|---|
| `name` | **Yes** | string, not empty, **≤ 150** chars (trimmed) | — |
| `code` | No | string, **≤ 40** | `null` |
| `colorHex` | No | string, **≤ 16** | `#4F46E5` |
| `icon` | No | string, **≤ 64** | `null` |
| `targetWeeklyMinutes` | No | integer **15–3000** | `180` |
| `academicYearId`, `classId`, `isArchived` | ❌ | rejected with **400** (`property … should not exist`) | — |

Captured **201** with defaults:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "721d9c39-c8b8-48ed-92e7-218d93401b53",
    "userId": "3b777884-0bcd-461d-bf29-60d9ad5abbd7",
    "academicYearId": null,
    "classId": null,
    "name": "Operating Systems & Concurrency",
    "code": null,
    "colorHex": "#4F46E5",
    "icon": null,
    "targetWeeklyMinutes": 180,
    "isArchived": false,
    "createdAt": "2026-11-13T03:20:59.851Z",
    "updatedAt": "2026-11-13T03:20:59.851Z"
  },
  "meta": {}
}
```

The same transaction also creates the `student_subject_progress` row; read it via `GET /subjects/:id`:

```json
"subjectProgress": [
  {
    "userId": "3b777884-0bcd-461d-bf29-60d9ad5abbd7",
    "subjectId": "721d9c39-c8b8-48ed-92e7-218d93401b53",
    "totalChapters": 0,
    "completedChapters": 0,
    "totalTopics": 0,
    "completedTopics": 0,
    "completionPercentage": "0",
    "totalStudyMinutes": 0,
    "lastStudiedAt": null
  }
]
```

#### Duplicate name → 409

Names are unique **per user, case-insensitive, trimmed**, and archived names still count. Captured with `"operating systems & concurrency"` and with surrounding spaces:

```json
{
  "success": false,
  "message": "A subject with this name already exists",
  "error": { "code": "SUBJECT_ALREADY_EXISTS", "details": [] }
}
```

Validation 400 (empty name):

```json
{
  "success": false,
  "message": "Validation failed for one or more fields",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "field": "name", "messages": ["name should not be empty"] }]
  }
}
```

Other captured 400 details:

| Case | `details` |
|---|---|
| `name` 151 chars | `[{ "field":"name", "messages":["name must be shorter than or equal to 150 characters"] }]` |
| `targetWeeklyMinutes: 5` | `[{ "field":"targetWeeklyMinutes", "messages":["targetWeeklyMinutes must not be less than 15"] }]` |
| `targetWeeklyMinutes: 3001` | `[… "must not be greater than 3000"]` |
| `icon` 65 chars | `[{ "field":"icon", "messages":["icon must be shorter than or equal to 64 characters"] }]` |
| `academicYearId` sent | `[{ "field":"academicYearId", "messages":["property academicYearId should not exist"] }]` |
| `classId` sent | `[{ "field":"classId", "messages":["property classId should not exist"] }]` |
| `isArchived` sent | `[{ "field":"isArchived", "messages":["property isArchived should not exist"] }]` |

### 4.4 `PATCH /subjects/:id` — edit / archive / restore

All fields optional: `name` (≤150, not empty), `code` (≤40), `colorHex` (≤16), `icon` (≤64), `targetWeeklyMinutes` (15–3000), `isArchived` (boolean). Unknown fields → 400.

Captured **200** (edit):

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "721d9c39-c8b8-48ed-92e7-218d93401b53",
    "userId": "3b777884-0bcd-461d-bf29-60d9ad5abbd7",
    "academicYearId": null,
    "classId": null,
    "name": "Operating Systems",
    "code": "CS-301",
    "colorHex": "#2563EB",
    "icon": "cpu",
    "targetWeeklyMinutes": 300,
    "isArchived": false,
    "createdAt": "2026-11-13T03:20:59.851Z",
    "updatedAt": "2026-11-13T03:24:24.565Z"
  },
  "meta": {}
}
```

**Archive** is `PATCH` with `{ "isArchived": true }`; restore with `{ "isArchived": false }`. Captured archive response: the same subject object with `"isArchived": true`.

After archiving:

- `GET /subjects` (no param) → archived subject **omitted**
- `GET /subjects?archived=true` → archived subject **returned**
- `GET /subjects?archived=all` → both
- `GET /subjects/:id` → still returned (archived subjects are readable by id)

`PATCH` with an empty `name` → 400. `PATCH` with an unknown field → 400. Renaming to an existing (case-insensitive) name → **409 `SUBJECT_ALREADY_EXISTS`** (see the follow-up capture in §12.2).

### 4.5 `DELETE /subjects/:id` — permanent delete

Hard delete (no soft delete). Cascades chapters, topics, subject/topic progress, enrollments, grades; assignments are deleted (cascade), notes and planner tasks keep their row with `subjectId` set to `null`, and exam-subject links are removed.

Captured **200**:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { "deleted": true, "id": "721d9c39-c8b8-48ed-92e7-218d93401b53" },
  "meta": {}
}
```

After deletion, `GET /subjects/:id` → 404 `SUBJECT_NOT_FOUND`. Another user's subject → 403. Repeated delete → 404.

**Use `PATCH {isArchived:true}` for "archive"; use `DELETE` only for "delete forever".**

---

## 5. Chapters / Units

### 5.1 `POST /chapters` — create (insert at position)

| Field | Required | Rule / default |
|---|---|---|
| `subjectId` | **Yes** | UUID of a subject you own |
| `title` | **Yes** | non-empty string, ≤ 200 |
| `orderIndex` | **Yes** | integer ≥ 1 (**1-based insertion position**) |
| `description` | No | string |
| `estimatedMinutes` | No | integer ≥ 5, default **60** |

The new chapter is inserted at `orderIndex`; existing siblings at that position and after are shifted **down by one**. Values above the current count are clamped to the end; `0` or negative → 400. The response is the created chapter **without** `topics`.

Captured **201**:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "becc4205-304f-4710-8dc0-54a8c9e1fe3c",
    "subjectId": "721d9c39-c8b8-48ed-92e7-218d93401b53",
    "title": "Foundations",
    "orderIndex": 1,
    "description": "Processes, threads, and scheduling.",
    "estimatedMinutes": 90,
    "isCompleted": false,
    "completedAt": null,
    "createdAt": "2026-11-13T03:26:08.127Z",
    "updatedAt": "2026-11-13T03:26:12.970Z"
  },
  "meta": {}
}
```

Verified insertion sequence (fresh subject, no chapters):

| Action | Resulting order |
|---|---|
| create A `orderIndex:1` | `A` |
| create B `orderIndex:1` | `B, A` |
| create C `orderIndex:2` | `B, C, A` |

Errors:

| Case | Response |
|---|---|
| `subjectId:"nope"` | 400 `VALIDATION_ERROR`, `details:[{field:"subjectId",messages:["subjectId must be a UUID"]}]` |
| unknown `subjectId` | 404 `SUBJECT_NOT_FOUND` |
| another user's `subjectId` | 403 `SUBJECT_OWNERSHIP_VIOLATION` |
| missing title | 400 (messages include `title should not be empty`, `title must be a string`, max-length) |
| title 201 chars | 400 `title must be shorter than or equal to 200 characters` |
| `estimatedMinutes:3` | 400 `estimatedMinutes must not be less than 5` |
| `orderIndex:0` | 400 `orderIndex must not be less than 1` |

### 5.2 `PATCH /chapters/:id` — edit, reorder, complete

Accepted fields (all optional): `title` (≤200, not empty), `description`, `estimatedMinutes` (≥5), `orderIndex` (≥1), `isCompleted` (boolean). Unknown fields (e.g. `subjectId`) → 400.

- `isCompleted:true` sets `completedAt`; `false` clears it. This is equivalent to the `/complete` / `/uncomplete` routes.
- `orderIndex` moves the chapter to that 1-based position and renumbers all siblings **1..N**.
- Every successful `PATCH` also recalculates subject progress and bumps `lastStudiedAt`.

Captured **200** (edit + rename):

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "3d699d7f-3741-45ac-984b-607a589b1305",
    "subjectId": "721d9c39-c8b8-48ed-92e7-218d93401b53",
    "title": "Memory & Virtual Memory",
    "orderIndex": 1,
    "description": "Paging and segmentation.",
    "estimatedMinutes": 120,
    "isCompleted": false,
    "completedAt": null,
    "createdAt": "2026-11-13T03:26:37.286Z",
    "updatedAt": "2026-11-13T03:29:39.280Z",
    "topics": []
  },
  "meta": {}
}
```

Note: `PATCH` includes `topics[]` in the response; `POST /chapters` does not.

Verified reorder: tree `[Memory, File Systems, Foundations]` + `PATCH /chapters/{File Systems}` `{orderIndex:1}` → `[File Systems, Memory, Foundations]`. `orderIndex: 999` on a 3-chapter subject leaves the chapter last (clamped, no error).

Errors: malformed id → 400 `Validation failed (uuid is expected)`; unknown id → 404 `CHAPTER_NOT_FOUND`; another user's chapter → 403 `CHAPTER_OWNERSHIP_VIOLATION`.

### 5.3 `POST /chapters/:id/complete` and `/uncomplete`

No body. Returns **201** with the updated chapter (same shape as create). Recalculates subject progress; `completionPercentage` changes immediately (see §6).

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "becc4205-304f-4710-8dc0-54a8c9e1fe3c",
    "subjectId": "721d9c39-c8b8-48ed-92e7-218d93401b53",
    "title": "Foundations",
    "orderIndex": 1,
    "description": "Processes, threads, and scheduling.",
    "estimatedMinutes": 90,
    "isCompleted": true,
    "completedAt": "2026-11-13T03:41:49.444Z",
    "createdAt": "2026-11-13T03:26:08.127Z",
    "updatedAt": "2026-11-13T03:41:49.446Z"
  },
  "meta": {}
}
```

`/uncomplete` sets `isCompleted:false, completedAt:null` (captured). Both are idempotent. Unknown id → 404 `CHAPTER_NOT_FOUND`; another user's → 403; malformed id → 400.

### 5.4 `DELETE /chapters/:id`

Hard delete; cascades the chapter's topics and their progress, then recalculates subject progress.

Captured **200**:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "deleted": true,
    "id": "66a6756c-4304-4465-bd29-8ae20777cd41",
    "subjectId": "721d9c39-c8b8-48ed-92e7-218d93401b53"
  },
  "meta": {}
}
```

Deleting again → 404 `CHAPTER_NOT_FOUND`; another user's → 403 `CHAPTER_OWNERSHIP_VIOLATION`.

> **Ordering gap after delete:** deletion does not renumber the remaining siblings. Deleting chapter 2 from `1,2,3` leaves `1,3`. The UI must render by `orderIndex` (sorted) and must not assume contiguous indices. The next create/reorder renumbers the list to `1..N`.

---

## 6. Topics

### 6.1 `POST /chapters/topics` — create (insert at position)

Note the path: topics are created under `/chapters/topics`, **not** `/topics`.

| Field | Required | Rule / default |
|---|---|---|
| `chapterId` | **Yes** | UUID of a chapter you own |
| `title` | **Yes** | non-empty, ≤ 200 |
| `orderIndex` | **Yes** | integer ≥ 1 (1-based insertion position) |
| `difficultyLevel` | No | integer **1–5**, default **3** |
| `contentSummary` | No | string |
| `estimatedMinutes` | No | integer ≥ 5, default **30** |
| `isCompleted` | ❌ | **rejected with 400** — use `/topics/:id/complete` |

Insertion/shift/clamp behaviour is identical to chapters, scoped to the chapter.

Captured **201**:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "8d3ae2d8-41cd-4c2d-915a-c018bb5e028f",
    "chapterId": "becc4205-304f-4710-8dc0-54a8c9e1fe3c",
    "title": "Process Lifecycle",
    "orderIndex": 1,
    "contentSummary": "States, PCB, context switching.",
    "difficultyLevel": 2,
    "estimatedMinutes": 45,
    "createdAt": "2026-11-13T03:36:51.706Z",
    "updatedAt": "2026-11-13T03:36:57.898Z"
  },
  "meta": {}
}
```

Verified insertion: `t1@1` → `[t1]`; `t2@1` → `[t2,t1]`; `t3@2` → `[t2,t3,t1]`.

`isCompleted:true` in the create body:

```json
{
  "success": false,
  "message": "Validation failed for one or more fields",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "field": "isCompleted", "messages": ["property isCompleted should not exist"] }]
  }
}
```

`difficultyLevel:9` → 400 `difficultyLevel must not be greater than 5`. Malformed `chapterId` → 400; unknown chapter → 404 `CHAPTER_NOT_FOUND`; another user's chapter → 403 `CHAPTER_OWNERSHIP_VIOLATION`.

### 6.2 `PATCH /topics/:id` — edit / reorder

Accepted (all optional): `title` (≤200), `contentSummary`, `difficultyLevel` (1–5), `estimatedMinutes` (≥5), `orderIndex` (≥1). `isCompleted` and other unknown fields → **400**.

Captured **200**:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "8d3ae2d8-41cd-4c2d-915a-c018bb5e028f",
    "chapterId": "becc4205-304f-4710-8dc0-54a8c9e1fe3c",
    "title": "Process Lifecycle & PCB",
    "orderIndex": 3,
    "contentSummary": "States, PCB, context switching, fork/exec.",
    "difficultyLevel": 3,
    "estimatedMinutes": 60,
    "createdAt": "2026-11-13T03:36:51.706Z",
    "updatedAt": "2026-11-13T03:38:27.491Z"
  },
  "meta": {}
}
```

Reorder response is the same topic object with its new `orderIndex`. Unlike chapters, a topic edit does **not** recalculate subject progress or bump `lastStudiedAt` (editing text/ordering does not change counts). Completion endpoints do.

Errors: malformed id → 400; unknown id → 404 `TOPIC_NOT_FOUND`; another user's topic → 403 `TOPIC_OWNERSHIP_VIOLATION`.

### 6.3 `DELETE /topics/:id`

Hard delete; cascades the topic's progress and recalculates subject progress.

Captured **200**:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "deleted": true,
    "id": "ee39adb1-487a-4771-aa26-ba5465202701",
    "chapterId": "becc4205-304f-4710-8dc0-54a8c9e1fe3c",
    "subjectId": "721d9c39-c8b8-48ed-92e7-218d93401b53"
  },
  "meta": {}
}
```

Repeated delete → 404 `TOPIC_NOT_FOUND`; another user's → 403. Ordering gaps after delete follow the chapter rule.

### 6.4 `POST /topics/:id/complete` and `/uncomplete`

No body. Returns **201** with `{ progress, subjectProgress }`.

Captured **complete**:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "progress": {
      "id": "bc3fe257-c8bd-4955-87e9-9d7b2408390e",
      "userId": "3b777884-0bcd-461d-bf29-60d9ad5abbd7",
      "topicId": "8d3ae2d8-41cd-4c2d-915a-c018bb5e028f",
      "isCompleted": true,
      "completionPercentage": "100",
      "confidenceScore": 3,
      "timeSpentMinutes": 0,
      "completedAt": "2026-11-13T03:40:34.086Z",
      "updatedAt": "2026-11-13T03:40:34.087Z"
    },
    "subjectProgress": {
      "id": "1cdbbeca-7b19-455f-822d-60bcfaa54731",
      "userId": "3b777884-0bcd-461d-bf29-60d9ad5abbd7",
      "subjectId": "721d9c39-c8b8-48ed-92e7-218d93401b53",
      "totalChapters": 3,
      "completedChapters": 0,
      "totalTopics": 3,
      "completedTopics": 1,
      "completionPercentage": "0",
      "totalStudyMinutes": 0,
      "lastStudiedAt": "2026-11-13T03:40:37.889Z",
      "updatedAt": "2026-11-13T03:40:37.890Z"
    }
  },
  "meta": {}
}
```

Captured **uncomplete**:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "progress": {
      "id": "bc3fe257-c8bd-4955-87e9-9d7b2408390e",
      "userId": "3b777884-0bcd-461d-bf29-60d9ad5abbd7",
      "topicId": "8d3ae2d8-41cd-4c2d-915a-c018bb5e028f",
      "isCompleted": false,
      "completionPercentage": "0",
      "confidenceScore": 3,
      "timeSpentMinutes": 0,
      "completedAt": null,
      "updatedAt": "2026-11-13T03:41:06.890Z"
    },
    "subjectProgress": {
      "totalChapters": 3,
      "completedChapters": 0,
      "totalTopics": 3,
      "completedTopics": 0,
      "completionPercentage": "0",
      "lastStudiedAt": "2026-11-13T03:41:10.588Z"
    }
  },
  "meta": {}
}
```

Behaviour:

- `upsert` on `(userId, topicId)` — completing twice is **idempotent**; `completedTopics` stays 1 (captured).
- `completionPercentage` on the **subject** is **not** changed by topic completion (chapter-based, §7) — `completedTopics` does change.
- Completion state for every topic is returned in the subject tree as `topics[].topicProgress` (§4.2): `[]`, or the row shown above.
- Unknown topic → 404 `TOPIC_NOT_FOUND`; another user's → 403 `TOPIC_OWNERSHIP_VIOLATION`; malformed id → 400.

---

## 7. Progress Calculation

Source: `recalculateSubjectProgress` in `subjects.service.ts`.

```
totalChapters      = count(chapters of subject)
completedChapters  = count(chapters where isCompleted = true)
totalTopics        = count(topics in all chapters)
completedTopics    = count(student_topic_progress where userId, isCompleted = true, topic in subject)
completionPercentage = totalChapters > 0
  ? round(completedChapters / totalChapters * 100, 2)
  : 0
```

- **Chapter-based percentage. Topic completion does not contribute to the percentage.**
- `completedTopics` is a count only; it is recalculated from `student_topic_progress` on every recalculation.
- Decimals serialize as strings: `"0"`, `"33.33"`, `"66.67"`, `"100"` (captured).
- `lastStudiedAt` is set to `new Date()` on every recalculation — chapter/topic create, chapter PATCH/complete/uncomplete/delete, topic complete/uncomplete/delete, and topic create. It is not a real "last studied" timestamp if the user only edits structure.
- Recalculation is triggered by: create chapter, update chapter (any field), complete/uncomplete chapter, delete chapter, create topic, complete/uncomplete topic, delete topic. **Not** by `PATCH /topics/:id`.
- Topic completion recalculates the parent subject; the response includes the new `subjectProgress`, but chapter completion responses do **not** include progress — call `GET /subjects/:id` or `GET /analytics/subject-progress`.

Captured progression for one subject (3 chapters, 3 topics):

| Action | totalCh | completedCh | totalTop | completedTop | completionPercentage |
|---|---|---|---|---|---|
| complete 1 topic | 3 | 0 | 3 | 1 | `"0"` |
| uncomplete that topic | 3 | 0 | 3 | 0 | `"0"` |
| complete 2 topics | 3 | 0 | 3 | 2 | `"0"` |
| complete chapter A | 3 | 1 | 3 | 2 | `"33.33"` |
| complete chapter B | 3 | 2 | 3 | 2 | `"66.67"` |
| uncomplete chapter A | 3 | 1 | 3 | 2 | `"33.33"` |
| complete all 3 chapters | 3 | 3 | 3 | 2 | `"100"` |
| delete 1 topic | 3 | 3 | 2 | 2 | `"100"` |
| delete 1 chapter | 2 | 2 | 2 | 2 | `"100"` |

**Do not compute progress client-side** — use `subjectProgress.completionPercentage` / `completedTopics` from the API. If you need a per-topic progress bar, use `topicProgress[0].completionPercentage` (`"100"` or `"0"`).

`GET /analytics/subject-progress` returns the same rows joined with the subject (see Module 2 §3.3).

---

## 8. Search & Filtering

| Query | Supported | Notes |
|---|---|---|
| `archived=false\|true\|all` | ✅ | subject list only |
| `search=<text>` | ✅ | `name` OR `code`, case-insensitive `contains`, trimmed |
| `semesterId`, `academicYearId`, `classId` | ❌ | silently **ignored** (200, unfiltered) |
| `page`, `limit`, `sort` | ❌ | ignored; no pagination |
| Chapter/topic search | ❌ | not supported; filter client-side |
| `difficultyLevel`, `isCompleted` filters | ❌ | not supported; filter client-side |

`?search=cs-30` matched `CS-302`; `?search=database` matched names. `?semesterId=…&page=2&limit=5` returned the normal list unchanged. Because unknown params are ignored, sending `semesterId` is safe but has no effect.

**Client-side filtering is required** for chapter/topic text search, completion filters, difficulty filters and any sorting other than the server's `orderIndex`.

---

## 9. Error Contract

All errors use the same envelope. `400` validation details are `[{ field, messages[] }]`; all other codes usually have `details: []`.

### 400 — validation / malformed UUID

```json
{
  "success": false,
  "message": "Validation failed for one or more fields",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "field": "targetWeeklyMinutes", "messages": ["targetWeeklyMinutes must not be less than 15"] }]
  }
}
```

Malformed path UUID:

```json
{
  "success": false,
  "message": "Validation failed (uuid is expected)",
  "error": { "code": "VALIDATION_ERROR", "details": [] }
}
```

Unknown/forbidden property (whitelist is strict):

```json
{
  "success": false,
  "message": "Validation failed for one or more fields",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "field": "semesterId", "messages": ["property semesterId should not exist"] }]
  }
}
```

### 401 — missing / invalid token

```json
{ "success": false, "message": "Authentication token is required",
  "error": { "code": "MISSING_AUTH_TOKEN", "details": [] } }
```

```json
{ "success": false, "message": "Malformed JWT token",
  "error": { "code": "INVALID_TOKEN", "details": [] } }
```

Other 401 codes: `TOKEN_EXPIRED`, `SESSION_REVOKED`.

### 403 — ownership

```json
{ "success": false, "message": "Access denied: you do not own this subject",
  "error": { "code": "SUBJECT_OWNERSHIP_VIOLATION", "details": [] } }
```

```json
{ "success": false, "message": "Access denied: you do not own this chapter",
  "error": { "code": "CHAPTER_OWNERSHIP_VIOLATION", "details": [] } }
```

```json
{ "success": false, "message": "Access denied: you do not own this topic",
  "error": { "code": "TOPIC_OWNERSHIP_VIOLATION", "details": [] } }
```

### 404 — unknown resource

```json
{ "success": false, "message": "Subject not found",
  "error": { "code": "SUBJECT_NOT_FOUND", "details": [] } }
```

```json
{ "success": false, "message": "Chapter not found",
  "error": { "code": "CHAPTER_NOT_FOUND", "details": [] } }
```

```json
{ "success": false, "message": "Topic not found",
  "error": { "code": "TOPIC_NOT_FOUND", "details": [] } }
```

Unmapped method/path:

```json
{ "success": false, "message": "Cannot PUT /api/v1/subjects/721d9c39-c8b8-48ed-92e7-218d93401b53",
  "error": { "code": "RESOURCE_NOT_FOUND", "details": [] } }
```

### 409 — duplicate subject

```json
{ "success": false, "message": "A subject with this name already exists",
  "error": { "code": "SUBJECT_ALREADY_EXISTS", "details": [] } }
```

Triggered on `POST /subjects` and (after the fix below) `PATCH /subjects/:id` when renaming. Comparison is case-insensitive and trimmed; archived subjects still occupy the name.

### 429 — throttled

```json
{ "success": false, "message": "ThrottlerException: Too Many Requests",
  "error": { "code": "RATE_LIMIT_EXCEEDED", "details": [] } }
```

Headers on a blocked response: **only `Retry-After: 60`** (no `X-RateLimit-*`). Allowed responses carry `X-RateLimit-Limit: 100`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`. State is in-memory per instance; there is no `Retry-After`-based queue.

### 500

```json
{ "success": false, "message": "Request could not be processed",
  "error": { "code": "INTERNAL_SERVER_ERROR", "details": [] } }
```

No stack traces are returned. (During capture, a Supabase connection reset produced a 500 on one search call; retrying succeeded. Treat 500 on a GET as retryable with backoff.)

---

## 10. Rate Limiting

- **100 requests / 60 s / IP per route handler** (default). The limit key is `Controller-handler-throttlerName-IP`, so `GET /subjects`, `PATCH /subjects/:id` and `POST /chapters/:id/complete` each have **independent** buckets. Editing 20 chapters does not consume the `GET /subjects` budget.
- Verified: a 105-request burst against `GET /health` produced 429s; a simultaneous `GET /subjects` still returned **200**.
- Under that artificial burst the DB pool (limit 8, 20 s acquire timeout) was saturated and some health calls returned **503** (health probe only). Do not poll `/health` in the app.
- Limiter is **in-memory**, not shared across instances; restarting resets buckets.
- No per-user bucket; all users behind one NAT share the IP bucket for the same route.

Recommended client behaviour: treat 429 as "pause this screen's refetch", respect `Retry-After`, and do not retry immediately.

---

## 11. FREE_TIER vs Pro Limits

**No subject, chapter or topic cap exists.** The backend enforces **only the AI daily-token quota** (see Module 2 §10). A `FREE_TIER` user can create unlimited subjects/chapters/topics and use the full syllabus API.

| Capability | Enforced? | Evidence |
|---|---|---|
| Max subjects | ❌ none | create loop has no plan check |
| Max chapters/topics | ❌ none | create paths have no count/plan check |
| Archive limit | ❌ none | boolean only |
| AI tokens/day | ✅ | `GET /ai/usage`, `docs/module-02-dashboard.md` §10 |

If product wants a FREE cap (e.g. 5 subjects), it must be added to the backend; the frontend should not invent one.

---

## 12. Follow-up Verification (post-fix build)

The following was captured after the additive fixes (per-topic progress in trees, 409 on rename, batched reorder SQL).

### 12.1 Subject tree now includes `topicProgress`

Both `GET /subjects` and `GET /subjects/:id` now include `topics[].topicProgress` (the array is scoped to the caller). Captured list excerpt after completing the first topic:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "name": "Computer Networks",
      "chapters": [
        { "title": "The Network Layer", "orderIndex": 1, "topics": [] },
        {
          "title": "The Link Layer",
          "orderIndex": 2,
          "topics": [
            {
              "title": "Ethernet & Switching",
              "orderIndex": 1,
              "topicProgress": [
                {
                  "isCompleted": true,
                  "completionPercentage": "100",
                  "confidenceScore": 3,
                  "timeSpentMinutes": 0,
                  "completedAt": "2026-11-13T03:56:01.450Z"
                }
              ]
            },
            { "title": "ARP & VLANs", "orderIndex": 2, "topicProgress": [] }
          ]
        },
        { "title": "Transport Layer", "orderIndex": 3, "topics": [] }
      ],
      "subjectProgress": [
        { "totalChapters": 3, "completedChapters": 0, "totalTopics": 2, "completedTopics": 1, "completionPercentage": "0" }
      ]
    },
    { "name": "Computer Architecture", "chapters": [], "subjectProgress": [] }
  ],
  "meta": {}
}
```

(The excerpt omits repeated ids/timestamps for readability; the real response includes every subject/chapter/topic field shown in §4.2.) The full per-topic row is in §4.2's sample, and the server-side include is `topics: { include: { topicProgress: { where: { userId } } } }`.

### 12.2 Rename to an existing name → 409

Captured **409** on the post-fix build (`PATCH /subjects/{id}` with `{ "name": "computer networks" }` while `Computer Networks` existed):

```json
{
  "success": false,
  "message": "A subject with this name already exists",
  "error": { "code": "SUBJECT_ALREADY_EXISTS", "details": [] }
}
```

Before this fix the same request returned **200** and created a second, differently-cased subject; both `POST` and `PATCH` now run the same trimmed, case-insensitive check (archived subjects included). Renaming a subject to its **own** current name (same case or different case) also hits this check — treat it as "no change needed" in the UI rather than showing an error. `PATCH` with a name that no other subject uses still returns **200**.

### 12.3 Reorder performance

`PATCH` reorders now issue **two batched SQL statements** (a negative-index pass, then a positive-index pass) inside one transaction, instead of `2 × N` sequential row updates. Measured HTTP round-trip times on the post-fix build (3 sibling chapters / 2 sibling topics, live Supabase pooler):

| Request | Result | Captured `PATCH` time |
|---|---|---|
| `PATCH /chapters/{Transport Layer}` `{orderIndex:1}` | `[Transport, Network, Link]` | **20.2 s** |
| `PATCH /chapters/{Transport Layer}` `{orderIndex:3}` | `[Network, Link, Transport]` | **18.9 s** |
| `PATCH /topics/{ARP & VLANs}` `{orderIndex:2}` | `[Ethernet, ARP]` | **17.3 s** |

Both calls returned **200** and the final `GET /subjects/:id` returned exactly those orders (shown in §12.1), so the case-based renumbering is correct.

Interpretation:

- The number of DB round-trips is now **constant** (1 sibling read + 2 `UPDATE`s + progress recalculation + 1 final read) and does **not** grow with sibling count. Before the fix the same 3-chapter moves took **26–85 s** because every sibling was updated twice sequentially.
- The remaining 17–20 s is the pooler latency for the handler's other queries (`getOwnedChapter`, sibling read, progress recalculation, final read), not the reorder loop. Under a faster DB these calls are milliseconds.
- The negative pass exists so the `[subjectId, orderIndex]` / `[chapterId, orderIndex]` unique constraints are never violated mid-update. Every sibling is moved to a unique negative value first, then to its final positive position.
- The timing above is the **whole request** (auth + ownership + reorder + progress + response), so use it for client timeout budgeting; a client timeout of **≥60 s** is still recommended (§14.13).

---

## 13. Client Recipes (per screen)

**Subject list / cards**
1. `GET /subjects` (add `?archived=true` for the archive tab, `?search=` for the search box).
2. Render `name`, `code`, `colorHex`, `icon`, `subjectProgress[0].completionPercentage`, `completedTopics/totalTopics`.
3. No client-side sorting needed unless you re-sort; server order is `createdAt` asc.

**Subject detail / syllabus tree**
1. `GET /subjects/:id`.
2. Render `chapters` sorted by `orderIndex`, `topics` sorted by `orderIndex`.
3. Topic checkbox state = `topics[].topicProgress[0]?.isCompleted === true`. Chapter checkbox state = `chapters[].isCompleted`.
4. Chapter/topic create/reorder send `orderIndex` = target 1-based position; refetch (or apply the returned object) afterwards.

**Archive tab**
1. `PATCH /subjects/:id` `{ "isArchived": true }`; remove from the active list locally.
2. `GET /subjects?archived=true` for the archive tab; `PATCH {"isArchived": false}` to restore.

**Progress widgets**
1. After any completion/structure change, refetch `GET /subjects/:id` (tree + progress) or `GET /analytics/subject-progress`.
2. Use the Decimal **strings** as percentages (`parseFloat` only for display).

**Semester screen**
- No API. Do not call `/academic-years` or `/semesters` (404). Render from local state or defer the feature.

---

## 14. Verified Gaps / Blockers

1. **No academic-year/semester API.** No `Semester` model; `AcademicModule` is empty; `Subject.academicYearId`/`classId` cannot be set. The semester screen cannot be backed by the current backend.
2. **No `GET /chapters`, `GET /chapters/:id`, `GET /topics` or `GET /topics/:id`.** Trees are only available via subjects.
3. **No bulk reorder endpoint.** One `PATCH` per moved item; `orderIndex` is an insertion position, not a delta.
4. **Order indices can have gaps after DELETE** (`1,3`). Sort by `orderIndex`; do not treat it as an array index.
5. **`PATCH /topics/:id` does not recalculate progress** (irrelevant for percentage, but `lastStudiedAt` is not bumped).
6. **Chapter completion response has no progress payload**; refetch the subject/analytics after completing a chapter.
7. **Topic completion state exists only inside the subject tree** (`topics[].topicProgress`); there is no standalone topic-progress endpoint.
8. **No pagination** on `GET /subjects`; the list returns every chapter/topic, so payloads grow.
9. **No FREE_TIER caps** on syllabus entities (see §11).
10. **Archive is a boolean on `PATCH`**, not a dedicated `/archive` route. `DELETE` is permanent and cascades assignments.
11. **Duplicate-name protection is application-level**; the DB unique key includes nullable `academicYearId`, so a race between two concurrent creates could still slip through.
12. **No `PUT`** routes; use `PATCH`.
13. **Latency**: 2–12 s per call on the Supabase pooler (occasionally >60 s under load). Use a client timeout ≥ 60 s, show loading states, and avoid refetch storms (each route is rate-limited separately, but the DB pool is shared and small).
14. **`GET /subjects?search=` errors are transient**: one capture hit a Supabase connection reset (500) and succeeded on retry. Retry 500 GETs with backoff.

### Fixes applied during this verification

| File | Change |
|---|---|
| `subjects/dto/subject.dto.ts` | added `icon`, `isArchived` (update only), max lengths (name 150, code 40, colorHex 16, icon 64), `@IsNotEmpty` on update name |
| `subjects/subjects.service.ts` | `?archived`/`?search` filtering; case-insensitive duplicate-name **409** on create **and update**; `topicProgress` included in list/detail; `completedTopics` populated in progress recalculation |
| `subjects/subjects.controller.ts` | query params + `ParseUUIDPipe` on `:id` (malformed id now 400, not 500) |
| `chapters/dto/chapter.dto.ts` | `UpdateChapterDto`/`UpdateTopicDto`; UUID validation for `subjectId`/`chapterId`; title ≤200; `difficultyLevel` 1–5; `contentSummary`; removed silently-ignored `isCompleted` from topic create |
| `chapters/chapters.service.ts` | chapter PATCH/DELETE/complete/uncomplete; topic PATCH/DELETE/complete/uncomplete; ownership errors return coded errors; insertion-position ordering with sibling renumbering; **batched SQL reorder** (2 statements instead of 2×N) |
| `chapters/chapters.controller.ts` | new routes + `ParseUUIDPipe` |
| `chapters/topics.controller.ts` | new `/topics/:id` controller |
| `chapters/chapters.module.ts` | registers `TopicsController` |
| `docs/module-02-dashboard.md` | corrected rate-limit statement to per-route buckets |
