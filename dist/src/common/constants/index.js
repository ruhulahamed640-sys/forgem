"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_UPLOAD_MIME_TYPES = exports.SENSITIVE_FIELDS = exports.IS_PUBLIC_KEY = exports.ROLES_KEY = void 0;
exports.ROLES_KEY = 'roles';
exports.IS_PUBLIC_KEY = 'isPublic';
exports.SENSITIVE_FIELDS = [
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
exports.ALLOWED_UPLOAD_MIME_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
//# sourceMappingURL=index.js.map