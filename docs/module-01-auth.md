# Module 1 — Authentication & Session Management (Verified API Contract)

**Status:** verified against the running backend on 12 Nov 2026 (live Supabase PostgreSQL).
**Scope:** Splash/session check, login, registration, email verification, forgot password, password reset, refresh, logout, current-user bootstrap.
**Important:** every `POST` endpoint returns **HTTP 201**, not 200. Clients must treat `201` as success.

---

## 1. Environment & Global Configuration

### 1.1 Base URLs

| Environment | Base URL | Status |
|---|---|---|
| Development (local) | `http://localhost:4000/api/v1` | **Verified live** |
| Swagger UI | `http://localhost:4000/api/docs` | **Verified live** |
| Health check | `http://localhost:4000/api/v1/health` | **Verified live** (local) |
| Production (Render) | `https://forgem.onrender.com/api/v1` | **Live** |
| Swagger (Render) | `https://forgem.onrender.com/api/docs` | **Live** |
| Health check (Render) | `https://forgem.onrender.com/api/v1/health` | **Live** |
| Staging | *not configured / not deployed* | No staging env file or host exists |
| Production (intended) | `https://api.studypilot.io/api/v1` | From `APP_URL`; not verified |

All paths below are relative to the base URL. The global prefix is `api/v1` (configurable via `API_PREFIX`).

### 1.2 Global request headers

| Header | Required | Notes |
|---|---|---|
| `Content-Type: application/json` | Yes for bodies | Request body limit is `1mb`. |
| `Accept: application/json` | Recommended | Not enforced. |
| `Authorization: Bearer <accessToken>` | Yes for protected routes | Custom HS256 JWT. |
| `Cookie: studypilot_refresh_token=<token>` | Browser only | Set/read automatically; cookie `Path=/api/v1/auth`. |
| `X-Request-Id` | Optional | Echoed back in the `X-Request-Id` response header (UUID generated if absent). |
| `X-Client-Id` | Optional, **unused** | Allowed by CORS but ignored. Send `clientId` in the login JSON body instead. |
| `X-CSRF-Token` | Optional, **unused** | Allowed by CORS, but no endpoint sets a CSRF cookie. Not required. |
| `X-Payment-Signature` | Payments webhook only | Not part of Module 1. |
| `X-App-Version`, `X-Platform`, `X-Timezone` | **Do NOT send** | Not in the CORS `Access-Control-Allow-Headers` list; adding them causes preflight failure. The backend also never reads them. Send timezone in the registration body / profile update instead. |

CORS (verified preflight `OPTIONS` → `204`):

```
Access-Control-Allow-Origin: <requesting origin if allow-listed>
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PATCH,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,X-CSRF-Token,X-Client-Id,X-Request-Id,X-Payment-Signature
```

Allow-listed origins are configured in `CORS_ALLOWED_ORIGINS`; any `chrome-extension://` origin is also allowed.

### 1.3 Authentication scheme & token lifetimes

- **Scheme:** custom HS256 JWT in `Authorization: Bearer <accessToken>`.
- **Access token lifetime:** **900 seconds (15 minutes)** — hard-coded, `JWT_ACCESS_EXPIRES_IN` is ignored.
- **Refresh token lifetime:** **7 days (604,800 s)** — hard-coded.
- **Session lifetime:** **7 days**, sliding — each successful refresh extends the session `expiresAt` to now + 7 days.
- **Refresh token format:** opaque 96-character hex string (48 random bytes); only its SHA-256 hash is stored.
- **Access token claims:** `id`, `email`, `roles[]`, `sessionId`, `clientId`, `iat`, `exp`.
- **Refresh delivery:**
  - Browser: `Set-Cookie: studypilot_refresh_token=...; Max-Age=604800; Path=/api/v1/auth; HttpOnly; SameSite=Lax` (`Secure` added only when `NODE_ENV=production`).
  - Non-browser (mobile, extension): the same token is also returned as `data.refreshToken` in the JSON body.
- Cookie-based access-token auth (`sp_access_token`) exists in the guard but **no endpoint sets that cookie**; Bearer is the only practical auth scheme.
- `POST /auth/refresh` accepts the refresh token from either the JSON body or the cookie.

### 1.4 Standard success envelope

Every 2xx response is wrapped:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {}
}
```

`meta` is currently always `{}`. The `message` is generic for success responses.

---

## 2. Endpoint Reference

### 2.a Login — `POST /auth/login`

| | |
|---|---|
| Auth required | No (`@Public`) |
| Rate limit | **10 requests / 60 s per IP** |
| Success | **201 Created** |
| Sets cookie | Yes (browser refresh cookie) |

**Request**

```json
{
  "email": "student@studypilot.io",
  "password": "StrongPass#2026!",
  "clientId": "web-app",
  "deviceName": "Chrome on Windows"
}
```

**Validation / rules**

| Field | Type | Rules |
|---|---|---|
| `email` | string | Required, valid email. Normalized with `trim()` + lowercase before lookup. |
| `password` | string | Required, non-empty. No complexity check on login. |
| `clientId` | string | Optional. Default `web-app`. Must be one of: `web-app`, `browser-extension-popup`, `browser-extension-sidepanel`, `mobile-client`. |
| `deviceName` | string | Optional, free text, no length limit. Defaults to `clientId`. |

Unknown properties are rejected (`forbidNonWhitelisted: true`).

**Success — 201**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
    "refreshToken": "3db95e69...1afb74",
    "expiresIn": 900,
    "clientId": "web-app",
    "sessionId": "65262a36-31af-4112-9609-f8089cc18602",
    "user": {
      "id": "1ab887f4-9278-4196-86ea-9c698401443c",
      "email": "student@studypilot.io",
      "status": "ACTIVE",
      "roles": ["STUDENT"],
      "profile": {
        "id": "c2d224ab-b92c-4e7e-9bbc-416405916985",
        "userId": "1ab887f4-9278-4196-86ea-9c698401443c",
        "firstName": "Flow",
        "lastName": "Test",
        "displayName": "Flow Test",
        "avatarStorageKey": null,
        "bio": null,
        "dateOfBirth": null,
        "phone": null,
        "institutionId": null,
        "classId": null,
        "academicYearId": null,
        "timezone": "Asia/Dhaka",
        "locale": "en-US",
        "createdAt": "2026-11-12T17:05:58.836Z",
        "updatedAt": "2026-11-12T17:05:58.836Z"
      }
    }
  },
  "meta": {}
}
```

**Errors**

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Malformed body / unknown field (details per field). |
| 400 | `INVALID_CLIENT_ID` | `clientId` not in the allow-list. |
| 401 | `INVALID_CREDENTIALS` | Unknown email **or** wrong password (same message, anti-enumeration). |
| 403 | `EMAIL_NOT_VERIFIED` | Valid credentials but `emailVerifiedAt` is null. |
| 403 | `ACCOUNT_SUSPENDED` | User status is `SUSPENDED` or `DELETED`. |
| 429 | `RATE_LIMIT_EXCEEDED` | More than 10 attempts/min from the same IP. |

**Business logic**

1. Rejects unsupported `clientId`.
2. Looks up the user by normalized email and verifies the scrypt password hash.
3. Writes a `LoginAttempt` audit row (success or failure).
4. Requires email verification and a non-suspended account.
5. Creates a `UserSession` + hashed `RefreshToken` (new token family), updates `lastLoginAt`.
6. Returns JWT + refresh token and sets the refresh cookie.

---

### 2.b Register / Sign Up — `POST /auth/register`

| | |
|---|---|
| Auth required | No |
| Rate limit | **10 requests / 60 s per IP** |
| Success | **201 Created** |

**Request**

```json
{
  "email": "student@studypilot.io",
  "password": "StrongPass#2026!",
  "firstName": "Arjun",
  "lastName": "Sharma",
  "timezone": "Asia/Kolkata"
}
```

**Validation / rules**

| Field | Type | Rules |
|---|---|---|
| `email` | string | Required, valid email, unique (case-insensitive). |
| `password` | string | Required, **8–128 chars**, must contain **at least one lowercase, one uppercase, and one digit**. No special character required. |
| `firstName` | string | Required, non-empty, max 100 chars, trimmed. |
| `lastName` | string | Required, non-empty, max 100 chars, trimmed. |
| `timezone` | string | Optional; defaults to `UTC`. No format/length validation. |

**Fields that do NOT exist:** there is **no `username`** field anywhere, and **no `phone`** field at registration. The DB profile has a nullable `phone`, but `UpdateProfileDto` currently does **not** expose it, so `PATCH /users/me` cannot set it either (only direct DB/admin writes can). Do not send `username` or `phone` — unknown fields cause `400 VALIDATION_ERROR`.

**Success — 201**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "user": {
      "id": "1b9c2453-cb77-407c-8745-d35313a534cd",
      "email": "student@studypilot.io",
      "status": "PENDING_VERIFICATION",
      "profile": {
        "id": "f7b0b92c-f824-4bac-9a9c-374f698e2d7d",
        "userId": "1b9c2453-cb77-407c-8745-d35313a534cd",
        "firstName": "Auth",
        "lastName": "Check",
        "displayName": "Auth Check",
        "avatarStorageKey": null,
        "bio": null,
        "dateOfBirth": null,
        "phone": null,
        "institutionId": null,
        "classId": null,
        "academicYearId": null,
        "timezone": "Asia/Dhaka",
        "locale": "en-US",
        "createdAt": "2026-11-12T17:03:35.240Z",
        "updatedAt": "2026-11-12T17:03:35.240Z"
      },
      "roles": ["STUDENT"]
    },
    "verificationTokenIssued": true
  },
  "meta": {}
}
```

**Errors**

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Any field fails validation. |
| 409 | `EMAIL_ALREADY_REGISTERED` | Email already exists. |
| 429 | `RATE_LIMIT_EXCEEDED` | More than 10 registrations/min from the same IP. |

**Business logic**

- Email is trimmed/lowercoded; password is hashed with **scrypt** (16-byte random salt), not Argon2.
- Creates user + profile + settings + points + `STUDENT` role (created on demand) in one transaction.
- Creates a **24-hour, single-use** email-verification token and emails a link:
  `{FRONTEND_URL}/verify-email?token=<raw-token>` (dev: `http://localhost:5173/verify-email?token=...`).
- **Registration does not log the user in** and returns no tokens.
- **Email delivery failures are logged and swallowed**, so 201 + `verificationTokenIssued: true` does not guarantee the email arrived. Provide a “Resend verification” action.

---

### 2.c Refresh Token — `POST /auth/refresh`

| | |
|---|---|
| Auth required | No (refresh token itself is the credential) |
| Rate limit | Global 100 req / 60 s / IP |
| Success | **201 Created** |
| Sets cookie | Yes |

**Request** — body is optional if the browser cookie is present:

```json
{ "refreshToken": "3db95e69...1afb74" }
```

`clientId` is accepted by the DTO but ignored.

**Success — 201**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
    "refreshToken": "1676b13f...f6d115",
    "expiresIn": 900,
    "sessionId": "2592f249-d080-4cf2-a683-2e7cbfec4d2f"
  },
  "meta": {}
}
```

**Errors**

| HTTP | Code | When |
|---|---|---|
| 401 | `REFRESH_TOKEN_REQUIRED` | Neither body token nor cookie supplied. |
| 401 | `INVALID_REFRESH_TOKEN` | Token not found. |
| 401 | `REFRESH_TOKEN_EXPIRED` | Token/session expired. |
| 401 | `REFRESH_TOKEN_REUSE_DETECTED` | An already-rotated/revoked token was presented. |
| 429 | `RATE_LIMIT_EXCEEDED` | Global limit exceeded. |

**Business logic**

- Rotates the refresh token on every call; the old token is revoked and linked to its replacement.
- **Reuse detection:** presenting an old/rotated token revokes **the entire token family and the session immediately** (verified). The client must then force re-login.
- Extends the session `expiresAt` to now + 7 days and updates `lastActiveAt`.
- The response always contains a new access token with a fresh 15-minute `exp`.

---

### 2.d Logout — `POST /auth/logout`

| | |
|---|---|
| Auth required | **Yes** — `Authorization: Bearer <accessToken>` |
| Rate limit | Global 100 req / 60 s / IP |
| Success | **201 Created** |
| Clears cookie | Yes |

> Logout needs a **valid, non-expired access token**. If the access token has expired, call `POST /auth/refresh` first, then logout. A refresh token alone cannot log out.

**Request**

```
POST /api/v1/auth/logout
Authorization: Bearer <accessToken>
```

Optional query: `?allDevices=true` to revoke every active session for the user.

No request body is defined; send `{}` or nothing.

**Success — 201**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "loggedOut": true,
    "scope": "CURRENT_SESSION"
  },
  "meta": {}
}
```

With `?allDevices=true`, `scope` is `"ALL_DEVICES"`.

**Errors**

| HTTP | Code | When |
|---|---|---|
| 401 | `MISSING_AUTH_TOKEN` | No Bearer header. |
| 401 | `INVALID_TOKEN` | Bad signature / malformed JWT. |
| 401 | `TOKEN_EXPIRED` | Access token past `exp`. |
| 401 | `SESSION_REVOKED` | Session already revoked/expired. |
| 403 | `ACCOUNT_SUSPENDED` | Account suspended/deleted. |

**Business logic**

- Revokes the session and all refresh tokens for that session (or all sessions when `allDevices=true`).
- Clears the `studypilot_refresh_token` cookie.
- The access token may still be cryptographically valid until `exp`, but every protected request checks the session, so it immediately returns `401 SESSION_REVOKED`. **Verified.**

---

### 2.e Forgot Password (request reset) — `POST /auth/forgot-password`

| | |
|---|---|
| Auth required | No |
| Rate limit | **10 requests / 60 s per IP** |
| Success | **201 Created** |

**Request**

```json
{ "email": "student@studypilot.io" }
```

**Success — 201** (identical for existing and unknown emails)

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { "resetEmailDispatched": true },
  "meta": {}
}
```

**Errors**

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid/missing email. |
| 429 | `RATE_LIMIT_EXCEEDED` | More than 10 requests/min per IP. |

**Business logic**

- Anti-enumeration: unknown emails return the same 201 response.
- Existing user: creates a **1-hour, single-use** reset token and emails a link:
  `{FRONTEND_URL}/reset-password?token=<raw-token>` (dev: `http://localhost:5173/reset-password?token=...`).
- Email delivery failures are logged and swallowed; the API still returns 201.
- Multiple reset requests create multiple valid tokens; previously issued tokens are not invalidated.

---

### 2.f Verify OTP / Reset Code — **NOT SUPPORTED**

**There is no OTP flow in this backend.** Verified by scanning all auth routes, DTOs, and the Prisma schema:

- No OTP endpoint, no OTP table/columns, no numeric-code generation.
- Verification and reset both use **opaque 64-hex-character tokens sent as email links**.
- **Mobile:** there is no 6-digit code and no API that knows about deep links. The backend only emails `{FRONTEND_URL}/reset-password?token=...`. The app can register that frontend path (or an `app://` equivalent configured as `FRONTEND_URL`) as a deep link, read the `token` query parameter, and POST it to `/auth/reset-password`. The same applies to `/verify-email?token=...`.
- The only related endpoints are the token-based ones below.

#### `POST /auth/verify-email` (public, 10/min)

Request: `{ "token": "<token-from-email-link>" }`
Success **201**: `{ "emailVerified": true }`
Errors: `400 INVALID_VERIFICATION_TOKEN` (invalid, already used, or expired after 24 h).
Effect: marks verification used, sets user `status=ACTIVE` and `emailVerifiedAt`.

#### `POST /auth/resend-verification` (public, 10/min)

Request: `{ "email": "student@studypilot.io" }`
Success **201**: `{ "verificationSent": true }` — same response for unknown/already-verified emails.
Errors: `400 VALIDATION_ERROR`, `429 RATE_LIMIT_EXCEEDED`.
Effect (existing unverified user only): issues a new 24-hour token and sends a new email link.

---

### 2.g Reset Password (submit new password) — `POST /auth/reset-password`

| | |
|---|---|
| Auth required | No (token from email is the credential) |
| Rate limit | **10 requests / 60 s per IP** |
| Success | **201 Created** |

**Request**

```json
{
  "token": "<token-from-email-link>",
  "newPassword": "AnotherPass#2026"
}
```

**Validation / rules**

| Field | Rules |
|---|---|
| `token` | Required, non-empty string. |
| `newPassword` | Required, **8–128 chars**, at least one lowercase, one uppercase, one digit. Same rule as registration. |

**Success — 201**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "passwordReset": true,
    "allSessionsRevoked": true
  },
  "meta": {}
}
```

**Errors**

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Weak password / missing fields (per-field details). |
| 400 | `INVALID_RESET_TOKEN` | Invalid, already used, or expired (>1 h). |
| 429 | `RATE_LIMIT_EXCEEDED` | More than 10 requests/min per IP. |

**Business logic**

- Token is single-use (`usedAt` set) and valid for **1 hour**.
- Hashes the new password with scrypt.
- **Revokes all user sessions and all refresh tokens.** All devices must log in again.
- Does not return tokens; the client should route to Login.

---

### 2.h Current Authenticated User

There are **two different “me” endpoints** — do not confuse them.

#### `GET /auth/me` — identity/session context (JWT only)

| | |
|---|---|
| Auth required | Yes |
| Success | **200 OK** |

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "1b9c2453-cb77-407c-8745-d35313a534cd",
    "email": "student@studypilot.io",
    "roles": ["STUDENT"],
    "sessionId": "2592f249-d080-4cf2-a683-2e7cbfec4d2f",
    "clientId": "mobile-client"
  },
  "meta": {}
}
```

- This is **just the decoded JWT identity**, not a profile. It performs no DB lookup beyond session validation.
- Use it as a cheap session check, but it does **not** confirm the profile still exists in a user-friendly shape.

#### `GET /users/me` — full profile bootstrap

| | |
|---|---|
| Auth required | Yes |
| Success | **200 OK** |

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": "1ab887f4-9278-4196-86ea-9c698401443c",
    "email": "student@studypilot.io",
    "status": "ACTIVE",
    "emailVerifiedAt": "2026-11-12T17:06:30.434Z",
    "profile": {
      "id": "c2d224ab-b92c-4e7e-9bbc-416405916985",
      "userId": "1ab887f4-9278-4196-86ea-9c698401443c",
      "firstName": "Flow",
      "lastName": "Test",
      "displayName": "Flow Test",
      "avatarStorageKey": null,
      "bio": null,
      "dateOfBirth": null,
      "phone": null,
      "institutionId": null,
      "classId": null,
      "academicYearId": null,
      "timezone": "Asia/Dhaka",
      "locale": "en-US",
      "createdAt": "2026-11-12T17:05:58.836Z",
      "updatedAt": "2026-11-12T17:05:58.836Z",
      "institution": null,
      "academicYear": null,
      "academicClass": null
    },
    "points": {
      "id": "d8f551ff-6755-4004-a9d4-738ca5e9f1ad",
      "userId": "1ab887f4-9278-4196-86ea-9c698401443c",
      "totalPointsEarned": 0,
      "currentBalance": 0,
      "totalPointsSpent": 0,
      "currentStreakDays": 0,
      "longestStreakDays": 0,
      "updatedAt": "2026-11-12T17:05:58.836Z"
    },
    "roles": ["STUDENT"]
  },
  "meta": {}
}
```

Errors: standard 401s; `404 USER_NOT_FOUND` if the user row no longer exists. If the profile row is missing, `profile` is `null` (`PATCH /users/me` would return `404 PROFILE_NOT_FOUND`).

#### Session management

- `GET /auth/sessions` → **200**, array of active sessions:
  ```json
  [
    {
      "id": "65262a36-31af-4112-9609-f8089cc18602",
      "clientId": "web-app",
      "deviceName": "Chrome on Windows",
      "ipAddress": "::1",
      "lastActiveAt": "2026-11-12T17:06:41.193Z",
      "expiresAt": "2026-11-19T17:06:40.478Z",
      "createdAt": "2026-11-12T17:06:41.193Z"
    }
  ]
  ```
- `DELETE /auth/sessions/:id` → **200** `{ "sessionRevoked": true, "sessionId": "..." }`
  Errors: `403 SESSION_OWNERSHIP_VIOLATION` if the session belongs to another user; `404`-style behavior is not used — missing sessions surface as the 403 above.

---

## 3. Error & Validation Contract

### 3.1 Error envelope (all non-2xx)

```json
{
  "success": false,
  "message": "Human-readable message",
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "details": []
  }
}
```

`details` is `[]` unless validation produced per-field entries. `message` may be a raw exception message for throttling (see 429).

### 3.2 400 / 422 — Validation errors

The API returns **400** (not 422) with `code: "VALIDATION_ERROR"` and an array of per-field objects:

```json
{
  "success": false,
  "message": "Validation failed for one or more fields",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "unexpectedField",
        "messages": ["property unexpectedField should not exist"]
      },
      {
        "field": "email",
        "messages": ["email must be an email"]
      },
      {
        "field": "password",
        "messages": [
          "Password must contain uppercase, lowercase, and numeric characters",
          "password must be longer than or equal to 8 characters"
        ]
      },
      {
        "field": "firstName",
        "messages": ["firstName should not be empty"]
      }
    ]
  }
}
```

- `field` is the property path (nested paths use dots, e.g. `profile.firstName`).
- `messages` is an array; one field can have multiple failures.
- **Unknown fields are rejected**, not stripped.
- `transform` + `enableImplicitConversion` is on, but send correct JSON types.

### 3.3 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication token is required",
  "error": { "code": "MISSING_AUTH_TOKEN", "details": [] }
}
```

Known 401 codes:

| Code | Meaning |
|---|---|
| `MISSING_AUTH_TOKEN` | No `Authorization: Bearer` header. |
| `INVALID_TOKEN` | Malformed JWT or bad signature. |
| `TOKEN_EXPIRED` | Access token expired. |
| `SESSION_REVOKED` | Session revoked/expired (logout, reuse detection, password reset, expiry). |
| `INVALID_CREDENTIALS` | Login: unknown email or wrong password. |
| `REFRESH_TOKEN_REQUIRED` | Refresh called with no token. |
| `INVALID_REFRESH_TOKEN` | Refresh token not found. |
| `REFRESH_TOKEN_EXPIRED` | Refresh token/session expired. |
| `REFRESH_TOKEN_REUSE_DETECTED` | Old rotated token replayed; session revoked. |

### 3.4 403 Forbidden

```json
{
  "success": false,
  "message": "Please verify your email before logging in",
  "error": { "code": "EMAIL_NOT_VERIFIED", "details": [] }
}
```

Known 403 codes: `EMAIL_NOT_VERIFIED`, `ACCOUNT_SUSPENDED`, `FORBIDDEN_ROLE`, `SESSION_OWNERSHIP_VIOLATION`, `AI_QUOTA_EXCEEDED`.

### 3.5 409 Conflict

```json
{
  "success": false,
  "message": "An account with this email already exists",
  "error": { "code": "EMAIL_ALREADY_REGISTERED", "details": [] }
}
```

### 3.6 429 Rate Limited

Verified live response:

```json
{
  "success": false,
  "message": "ThrottlerException: Too Many Requests",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "details": []
  }
}
```

Headers on a 429 (and all responses):

```
Retry-After: 60
X-RateLimit-Limit: 10        (route-specific)
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 60
```

> The `message` is the raw throttler string (`"ThrottlerException: Too Many Requests"`). Match on `error.code`, not on the message.

### 3.7 500 Internal Server Error

Unhandled/unexpected exception (generic fallback; stack traces are never returned):

```json
{
  "success": false,
  "message": "Request could not be processed",
  "error": { "code": "INTERNAL_SERVER_ERROR", "details": [] }
}
```

Variant: an explicit `HttpException` with status 500 but no `code` maps via status to `REQUEST_FAILED`:

```json
{
  "success": false,
  "message": "Request could not be processed",
  "error": { "code": "REQUEST_FAILED", "details": [] }
}
```


### 3.8 Status codes at a glance

| Endpoint | Success |
|---|---|
| `POST /auth/register` | **201** |
| `POST /auth/login` | **201** |
| `POST /auth/refresh` | **201** |
| `POST /auth/logout` | **201** |
| `POST /auth/forgot-password` | **201** |
| `POST /auth/reset-password` | **201** |
| `POST /auth/verify-email` | **201** |
| `POST /auth/resend-verification` | **201** |
| `GET /auth/me` | **200** |
| `GET /auth/sessions` | **200** |
| `DELETE /auth/sessions/:id` | **200** |
| `GET /users/me` | **200** |

---

## 4. Business Rules, Entitlements & Offline Caching

### 4.1 Password & account rules

- **Password complexity:** 8–128 characters; at least one lowercase letter, one uppercase letter, and one digit. **No special character required.** Applied to registration and reset; **not** applied to login.
- **Email verification:** mandatory before login. New users are `PENDING_VERIFICATION`. Verification link/token is valid **24 hours** and single-use. Login before verification → `403 EMAIL_NOT_VERIFIED`.
- **Account states:** `ACTIVE`, `PENDING_VERIFICATION`, `SUSPENDED`, `DELETED`. Suspended/deleted users cannot log in or use tokens (`403 ACCOUNT_SUSPENDED`).
- **Account lockout:** **none.** Failed logins are only recorded in the `LoginAttempt` audit table.
- **Rate limiting:** per-IP, per-route, fixed 60-second window:
  - Auth routes (register, login, forgot-password, reset-password, verify-email, resend-verification): **10/min**.
  - All other routes: **100/min** (global default).
  - Storage is in-memory; limits are **not shared across multiple server instances** and reset on restart.
- **Session revocation triggers:** logout, logout-all, refresh-token reuse detection, password reset, admin suspension, session expiry.
- **Password hashing:** scrypt with a random 16-byte salt (despite Argon2 comments/config keys). Passwords are never returned.

### 4.2 Subscription / entitlement fields

**Neither the login response nor `/auth/me` nor `/users/me` contains subscription, plan, or entitlement flags.** Verified in live responses. The app must call separate endpoints:

| Endpoint | Auth | Response |
|---|---|---|
| `GET /subscriptions/me` | Bearer | The full latest subscription object (with `plan` and `invoices`), or `{}` when the user has none. |
| `GET /ai/usage` | Bearer | `{ "quota": { "dailyLimit": 25000, "usedToday": 0, "remainingTokens": 25000, "planCode": "FREE_TIER" }, "recentLogs": [] }` |
| `GET /subscriptions/plans` | Public | Active plans array. **Currently `[]`** because `subscription_plans` is empty (seed data missing). |

- Default tier is `FREE_TIER` with a **25,000 token/day** AI quota.
- `planCode` on `/ai/usage` is the most reliable lightweight entitlement signal at launch.
- `/subscriptions/me` returns `{}` (not `null`, not 404) when there is no subscription.
- There are currently **zero** active subscriptions and zero seeded plans in the live DB.

### 4.3 Recommended splash / session-bootstrap flow

```
1. Read stored accessToken (+ refreshToken on non-browser).
2. If no token            -> show Login.
3. If accessToken present -> GET /auth/me (fast identity check).
   - 200                  -> GET /users/me and GET /ai/usage in parallel -> Home.
   - 401 (any code)       -> try POST /auth/refresh once (body token or cookie).
       - 201              -> retry GET /auth/me -> Home.
       - 401              -> clear tokens/profile cache -> Login.
4. If access token missing but refresh token exists -> POST /auth/refresh directly.
```

- Never call `/auth/refresh` in a loop. On `REFRESH_TOKEN_REUSE_DETECTED` or any refresh 401, clear local session state and force login.
- Access token TTL is only 15 minutes; implement a single-flight refresh (one refresh call at a time, queue other 401s).
- Expect **201** from all POSTs.

### 4.4 Offline caching rules

| Data | Cache? | Recommended policy |
|---|---|---|
| Access token | Yes, cautiously | Store with its `exp` (15 min). Refresh proactively ~60 s before expiry. Never cache on a shared device. |
| Refresh token (web) | **No plaintext storage** | Browser: rely on the httpOnly cookie (`credentials: 'include'`). Do not read/write it from JS. |
| Refresh token (mobile/extension) | Yes | Store in OS secure storage / extension secure storage, never `localStorage` or logs. |
| `/users/me` profile | Yes | Persist last known profile for instant splash render. Treat as stale; revalidate on every app launch and after profile mutations. Recommended max age ~15 min. |
| `/auth/me` identity | Optional | Recompute from the JWT locally; no need to persist separately. |
| Session/entitlement state | Yes, with timestamps | Cache `planCode`/quota with a timestamp; mark stale after ~5–15 min; revalidate before AI calls or checkout. |
| Auth error state | **No** | Do not cache 401/403/429 responses. |

Cache invalidation: on logout, any 401, password reset, or `REFRESH_TOKEN_REUSE_DETECTED`, clear **all** cached auth/profile/entitlement data.

Server cache headers: no `Cache-Control` policy is set for auth responses (helmet adds security headers; Express adds weak ETags to GETs, e.g. health). Do **not** rely on HTTP caching for auth/profile data; do not cache tokens in a shared HTTP cache.

### 4.5 Response times (important for UX)

Live DB queries through the Supabase pooler in `ap-southeast-2` take ~2–9 seconds per request; observed auth timings:

| Endpoint | Observed |
|---|---|
| `POST /auth/login` | ~8 s |
| `POST /auth/register` | ~17–32 s (includes awaited SMTP send) |
| `POST /auth/refresh` | ~9–11 s |
| `GET /auth/me` | ~2–3 s |
| `GET /users/me` | ~7 s |
| `POST /auth/forgot-password` | ~2–8 s |

Recommendations:

- Set client HTTP timeouts to **≥ 60 s** for auth endpoints (registration may legitimately take 30 s+).
- Show a blocking loader on login/register; do not auto-retry POSTs blindly.
- The DB pooler latency is infrastructure-related; a direct IPv6 connection is ~4–5× faster but deployment-dependent.

---

## 5. Quick Reference (copy/paste)

```http
POST /api/v1/auth/register        public   201  {email,password,firstName,lastName,timezone?}
POST /api/v1/auth/login           public   201  {email,password,clientId?,deviceName?}
POST /api/v1/auth/refresh         public   201  {refreshToken?}          (or cookie)
POST /api/v1/auth/logout          Bearer   201  ?allDevices=true
POST /api/v1/auth/forgot-password public   201  {email}
POST /api/v1/auth/verify-email    public   201  {token}
POST /api/v1/auth/resend-verification public 201 {email}
POST /api/v1/auth/reset-password  public   201  {token,newPassword}
GET  /api/v1/auth/me              Bearer   200
GET  /api/v1/auth/sessions        Bearer   200
DELETE /api/v1/auth/sessions/:id  Bearer   200
GET  /api/v1/users/me             Bearer   200
GET  /api/v1/subscriptions/me     Bearer   200  (entitlements, may be {})
GET  /api/v1/ai/usage             Bearer   200  (planCode/quota)
```

**Client checklist**

- [ ] Accept `201` for all auth POSTs.
- [ ] Send `clientId` in the login JSON body (never as a header).
- [ ] Do not send `X-App-Version` / `X-Platform`.
- [ ] Use `credentials: 'include'` in browsers for the refresh cookie.
- [ ] Implement single-flight refresh on 401.
- [ ] Clear cached profile/tokens on logout, 401, password reset, and refresh reuse.
- [ ] Allow ≥60 s timeouts and a loading state during auth requests.
- [ ] Match errors by `error.code`, never by `message`.
