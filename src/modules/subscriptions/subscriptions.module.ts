import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, ConfigService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
