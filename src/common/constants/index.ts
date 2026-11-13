export const ROLES_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';
export const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'password_hash',
  // NOTE: `refreshToken` is intentionally NOT listed here. Login/refresh
  // responses must return the rotated refresh token to non-browser clients
  // (mobile app, browser extension); browser clients receive it as an
  // httpOnly cookie instead. Token *hashes* are still redacted below.
  'tokenHash',
  'token_hash',
  'encryptedApiKeyRef',
  'secret',
  'verificationSecret',
  'resetToken',
];

export const ALLOWED_UPLOAD_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
