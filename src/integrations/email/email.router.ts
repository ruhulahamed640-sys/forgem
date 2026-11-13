import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailPayload, EmailTransport, SmtpEmailProvider } from './smtp-email.provider';
import { HttpEmailProvider } from './http-email.provider';

export interface EmailPayloadResult {
  messageId: string;
  accepted: boolean;
}

/**
 * Router that picks SMTP or HTTP transport based on EMAIL_PROVIDER env.
 *
 * Render (and most serverless hosts) block outbound SMTP ports 25/465/587,
 * so EMAIL_PROVIDER must be set to resend | brevo | mailgun there.
 */
@Injectable()
export class EmailRouter implements EmailTransport {
  private readonly logger = new Logger(EmailRouter.name);
  private readonly provider: string;

  constructor(
    private readonly config: ConfigService,
    private readonly smtp: SmtpEmailProvider,
    private readonly http: HttpEmailProvider,
  ) {
    this.provider = (this.config.get<string>('EMAIL_PROVIDER') || 'smtp').trim().toLowerCase();
    this.logger.log(`Email transport selected: ${this.provider}`);
    if (this.provider === 'smtp') {
      const renderFlag =
        this.config.get<string>('RENDER') === 'true' ||
        Boolean(this.config.get<string>('RENDER_SERVICE_ID'));
      if (renderFlag) {
        this.logger.warn(
          'SMTP transport on Render will time out (outbound SMTP blocked). ' +
            'Set EMAIL_PROVIDER=resend|brevo|mailgun + matching API key.',
        );
      }
    }
  }

  private get transport(): EmailTransport {
    return this.provider === 'smtp' ? this.smtp : this.http;
  }

  async sendEmail(payload: EmailPayload): Promise<EmailPayloadResult> {
    return this.transport.sendEmail(payload);
  }

  async sendVerificationEmail(to: string, token: string) {
    const frontendUrl = this.config.get<string>('email.frontendUrl') || 'http://localhost:5173';
    const url = new URL('/verify-email', frontendUrl);
    url.searchParams.set('token', token);

    return this.sendEmail({
      to,
      subject: 'Verify your StudyPilot account',
      text: `Verify your StudyPilot account: ${url.toString()}`,
      htmlBody: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#211638">
          <h1 style="color:#6847B8">Welcome to StudyPilot</h1>
          <p>Thank you for registering. Please verify your email address.</p>
          <p>
            <a href="${url.toString()}"
               style="display:inline-block;padding:13px 22px;background:#6847B8;color:#fff;text-decoration:none;border-radius:8px">
              Verify Email
            </a>
          </p>
          <p>This verification link expires in 24 hours.</p>
          <p>If you did not create this account, you can ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const frontendUrl = this.config.get<string>('email.frontendUrl') || 'http://localhost:5173';
    const url = new URL('/reset-password', frontendUrl);
    url.searchParams.set('token', token);

    return this.sendEmail({
      to,
      subject: 'Reset your StudyPilot password',
      text: `Reset your StudyPilot password: ${url.toString()}`,
      htmlBody: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#211638">
          <h1 style="color:#6847B8">Password Reset</h1>
          <p>We received a request to reset your StudyPilot password.</p>
          <p>
            <a href="${url.toString()}"
               style="display:inline-block;padding:13px 22px;background:#6847B8;color:#fff;text-decoration:none;border-radius:8px">
              Reset Password
            </a>
          </p>
          <p>This link expires in 1 hour.</p>
          <p>If you did not request this, ignore this email.</p>
        </div>
      `,
    });
  }
}