import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ALLOWED_UPLOAD_MIME_TYPES } from '../../common/constants';

export interface UploadMetadataInput {
  userId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  entityNamespace: 'assignments' | 'resources' | 'avatars';
}

@Injectable()
export class S3StorageService {
  private readonly maxBytes = parseInt(
    process.env.MAX_UPLOAD_FILE_SIZE_BYTES || '10485760',
    10,
  );
  private readonly bucketName =
    process.env.S3_BUCKET_NAME || 'studypilot-production-assets';

  validateAndCreateObjectKey(input: UploadMetadataInput) {
    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(input.mimeType)) {
      throw new BadRequestException({
        message: `Unsupported MIME type: ${input.mimeType}`,
        code: 'INVALID_FILE_MIME_TYPE',
      });
    }
    if (input.fileSizeBytes <= 0 || input.fileSizeBytes > this.maxBytes) {
      throw new BadRequestException({
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

  verifyAttachmentOwnership(ownerUserId: string, requestingUserId: string): void {
    if (ownerUserId !== requestingUserId) {
      throw new ForbiddenException({
        message: 'Access denied: you do not own this stored attachment',
        code: 'STORAGE_OWNERSHIP_VIOLATION',
      });
    }
  }
}
