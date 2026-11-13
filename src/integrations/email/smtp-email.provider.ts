
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  htmlBody: string;
  text?: string;
}

@Injectable()
export class SmtpEmailProvider {
  private readonly logger = new Logger(SmtpEmailProvider.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('email.host'),
      port: this.config.get<number>('email.port'),
      secure: this.config.get<boolean>('email.secure'),
      auth: {
        user: this.config.get<string>('email.user'),
        pass: this.config.get<string>('email.password'),
      },
      // Never let a slow/unreachable SMTP server block an HTTP request forever.
      connectionTimeout: this.config.get<number>('email.connectionTimeoutMs') ?? 10000,
      greetingTimeout: this.config.get<number>('email.greetingTimeoutMs') ?? 10000,
      socketTimeout: this.config.get<number>('email.socketTimeoutMs') ?? 20000,
    });
  }

  async sendEmail(payload: EmailPayload): Promise<{ messageId: string; accepted: boolean }> {
    const from = this.config.get<string>('email.from');
    const fromName = this.config.get<string>('email.fromName') || 'StudyPilot';

    if (!from || !this.config.get<string>('email.user') ||
        !this.config.get<string>('email.password')) {
      throw new InternalServerErrorException('SMTP configuration is incomplete');
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${from}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.htmlBody,
        text: payload.text,
      });

      this.logger.log(`Email sent to ${payload.to}: ${info.messageId}`);

      return {
        messageId: info.messageId,
        accepted: info.accepted.length > 0,
      };
    } catch (error) {
      this.logger.error(
        `Email delivery failed for ${payload.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    const frontendUrl = this.config.get<string>('email.frontendUrl');
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
    const frontendUrl = this.config.get<string>('email.frontendUrl');
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
