import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PaymentGatewayProvider {
  createProviderCheckoutSession(params: { userId: string; planCode: string; amountCents: number }) {
    const sessionId = `cs_sp_${crypto.randomBytes(12).toString('hex')}`;
    return {
      sessionId,
      url: `https://checkout.studypilot.io/session/${sessionId}`,
      amountCents: params.amountCents,
    };
  }
}
