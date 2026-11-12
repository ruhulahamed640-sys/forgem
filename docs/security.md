# StudyPilot — Security Architecture

1. **Password & Token Cryptography**:
   - Passwords are never stored in plaintext; Argon2id / Scrypt with per-user cryptographic salts and `crypto.timingSafeEqual` verification are used.
   - Refresh tokens, email verification tokens, and password reset tokens are hashed with SHA-256 before persistence (`token_hash`).
2. **Refresh Token Rotation & Reuse Detection**:
   - Every refresh token belongs to a `token_family` (`UUID`). When a refresh token is rotated, it is marked `is_revoked = true` and linked via `replaced_by_token_id`.
   - If a previously rotated token is replayed, StudyPilot immediately revokes the entire `token_family` and terminates the `user_session`.
3. **Strict Ownership & Role Enforcement**:
   - Ownership is verified against `req.user.id` extracted from the verified JWT session—never from client-supplied `userId` parameters.
   - Administrative endpoints enforce `@Roles('ADMIN', 'SUPER_ADMIN')` via `RolesGuard` and write immutable records to `admin_actions` and `audit_logs`.
4. **Anti-Abuse Point & Session Integrity**:
   - Study session duration is computed exclusively from server-side timestamps (`endTime - startTime - totalBreakSeconds`), capped at 8 hours, with a 15-minute minimum for point eligibility, cooldown windows, daily caps, and unique `idempotency_key` constraints on `point_transactions` and `reward_redemptions`.
5. **Payment Webhook Verification**:
   - `POST /api/v1/payments/webhook` verifies the `X-Payment-Signature` HMAC-SHA256 digest before parsing events and enforces uniqueness on `provider_event_id` in `payment_webhooks`.
