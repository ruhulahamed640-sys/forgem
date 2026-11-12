export const ROLES_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';
export const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'password_hash',
  'refreshToken',
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
