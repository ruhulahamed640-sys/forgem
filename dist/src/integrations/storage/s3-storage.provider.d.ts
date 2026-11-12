export interface UploadMetadataInput {
    userId: string;
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
    entityNamespace: 'assignments' | 'resources' | 'avatars';
}
export declare class S3StorageService {
    private readonly maxBytes;
    private readonly bucketName;
    validateAndCreateObjectKey(input: UploadMetadataInput): {
        bucket: string;
        storageKey: string;
        uploadUrl: string;
        expiresInSeconds: number;
    };
    verifyAttachmentOwnership(ownerUserId: string, requestingUserId: string): void;
}
