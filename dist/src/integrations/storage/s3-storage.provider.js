"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const constants_1 = require("../../common/constants");
let S3StorageService = class S3StorageService {
    maxBytes = parseInt(process.env.MAX_UPLOAD_FILE_SIZE_BYTES || '10485760', 10);
    bucketName = process.env.S3_BUCKET_NAME || 'studypilot-production-assets';
    validateAndCreateObjectKey(input) {
        if (!constants_1.ALLOWED_UPLOAD_MIME_TYPES.includes(input.mimeType)) {
            throw new common_1.BadRequestException({
                message: `Unsupported MIME type: ${input.mimeType}`,
                code: 'INVALID_FILE_MIME_TYPE',
            });
        }
        if (input.fileSizeBytes <= 0 || input.fileSizeBytes > this.maxBytes) {
            throw new common_1.BadRequestException({
                message: `File size must be between 1 byte and ${this.maxBytes} bytes`,
                code: 'FILE_SIZE_LIMIT_EXCEEDED',
            });
        }
        const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueId = crypto.randomUUID();
        const storageKey = `${input.entityNamespace}/${input.userId}/${uniqueId}-${safeFileName}`;
        return {
            bucket: this.bucketName,
            storageKey,
            uploadUrl: `https://${this.bucketName}.s3.amazonaws.com/${storageKey}?X-Amz-Expires=900`,
            expiresInSeconds: 900,
        };
    }
    verifyAttachmentOwnership(ownerUserId, requestingUserId) {
        if (ownerUserId !== requestingUserId) {
            throw new common_1.ForbiddenException({
                message: 'Access denied: you do not own this stored attachment',
                code: 'STORAGE_OWNERSHIP_VIOLATION',
            });
        }
    }
};
exports.S3StorageService = S3StorageService;
exports.S3StorageService = S3StorageService = __decorate([
    (0, common_1.Injectable)()
], S3StorageService);
//# sourceMappingURL=s3-storage.provider.js.map