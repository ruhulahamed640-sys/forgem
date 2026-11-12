import { Global, Module } from '@nestjs/common';
import { S3StorageService } from '../../integrations/storage/s3-storage.provider';

@Global()
@Module({
  providers: [S3StorageService],
  exports: [S3StorageService],
})
export class StorageModule {}
