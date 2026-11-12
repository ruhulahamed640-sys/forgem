import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { Public } from '../../common/decorators/roles.decorator';
import { CreateCheckoutSessionDto } from './dto/subscription.dto';

@ApiTags('Subscriptions & Payments')
@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Public()
  @Get('subscriptions/plans')
  @ApiOperation({ summary: 'List active free and premium subscription plans' })
  listPlans() {
    return this.subscriptionsService.listPlans();
  }

  @ApiBearerAuth()
  @Get('subscriptions/me')
  @ApiOperation({ summary: 'Retrieve current user active subscription and feature entitlements' })
  getMySubscription(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.getMySubscription(user.id);
  }

  @ApiBearerAuth()
  @Post('subscriptions/checkout')
  @ApiOperation({ summary: 'Initiate an idempotent subscription checkout transaction' })
  createCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.subscriptionsService.createCheckout(user.id, dto);
  }

  @ApiBearerAuth()
  @Get('payments/history')
  @ApiOperation({ summary: 'Retrieve user payment transactions and invoices' })
  getPaymentHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.getPaymentHistory(user.id);
  }

  @Public()
  @Post('payments/webhook')
  @ApiOperation({ summary: 'Process cryptographically signed payment provider webhooks (idempotent)' })
  handleWebhook(
    @Body() payload: any,
    @Headers('x-Payment-Signature') signature: string,
    @Headers('x-payment-signature') lowerSignature: string,
  ) {
    return this.subscriptionsService.processWebhook(
      payload,
      signature || lowerSignature || '',
    );
  }
}
