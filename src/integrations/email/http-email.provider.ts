import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailPayload, EmailTransport } from './smtp-email.provider';

/**
 * HTTP-based email transport.
 *
 * Render (and most serverless PaaS providers) block outbound SMTP ports
 * 25 / 465 / 587, which makes direct SMTP delivery time out. HTTP APIs
 * such as Resend, Brevo (Sendinblue) and Mailgun are reachable over
 * port 443 and therefore work on Render.
 */
@Injectable()
export class HttpEmailProvider implements EmailTransport {
  private readonly logger = new Logger(HttpEmailProvider.name);

  constructor(private readonly config: ConfigService) {}

  private get provider(): string {
    return (this.config.get<string>('EMAIL_PROVIDER') || '').trim().toLowerCase();
  }

  async sendEmail(payload: EmailPayload): Promise<{ messageId: string; accepted: boolean }> {
    const from = this.config.get<string>('email.from') || '';
    const fromName = this.config.get<string>('email.fromName') || 'StudyPilot';
    const fromHeader = from ? `${fromName} <${from}>` : fromName;

    switch (this.provider) {
      case 'resend':
        return this.sendViaResend(fromHeader, payload);
      case 'brevo':
        return this.sendViaBrevo(fromHeader, payload);
      case 'mailgun':
        return this.sendViaMailgun(fromHeader, payload);
      default:
        throw new Error(
          `EMAIL_PROVIDER is not configured (got "${this.provider}"). ` +
            'Set EMAIL_PROVIDER to resend | brevo | mailgun when SMTP is blocked by the host.',
        );
    }
  }

  private async sendViaResend(
    from: string,
    payload: EmailPayload,
  ): Promise<{ messageId: string; accepted: boolean }> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) throw new Error('RESEND_API_KEY is required when EMAIL_PROVIDER=resend');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        html: payload.htmlBody,
        text: payload.text,
      }),
    });

    const body = await res.text();
    if (!res.ok) throw new Error(`Resend API ${res.status}: ${body}`);

    const parsed = JSON.parse(body) as { id?: string };
    return { messageId: parsed.id || 'resend', accepted: true };
  }

  private async sendViaBrevo(
    from: string,
    payload: EmailPayload,
  ): Promise<{ messageId: string; accepted: boolean }> {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    if (!apiKey) throw new Error('BREVO_API_KEY is required when EMAIL_PROVIDER=brevo');

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: from.split('<')[0].trim().replace(/"/g, ''), email: from.match(/<(.+)>/)?.[1] || from },
        to: [{ email: payload.to }],
        subject: payload.subject,
        htmlContent: payload.htmlBody,
        textContent: payload.text,
      }),
    });

    const body = await res.text();
    if (!res.ok) throw new Error(`Brevo API ${res.status}: ${body}`);

    const parsed = JSON.parse(body) as { messageId?: string };
    return { messageId: parsed.messageId || 'brevo', accepted: true };
  }

  private async sendViaMailgun(
    from: string,
    payload: EmailPayload,
  ): Promise<{ messageId: string; accepted: boolean }> {
    const apiKey = this.config.get<string>('MAILGUN_API_KEY');
    const domain = this.config.get<string>('MAILGUN_DOMAIN');
    if (!apiKey || !domain) {
      throw new Error('MAILGUN_API_KEY and MAILGUN_DOMAIN are required when EMAIL_PROVIDER=mailgun');
    }

    const form = new URLSearchParams();
    form.set('from', from);
    form.set('to', payload.to);
    form.set('subject', payload.subject);
    form.set('html', payload.htmlBody);
    if (payload.text) form.set('text', payload.text);

    const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    const body = await res.text();
    if (!res.ok) throw new Error(`Mailgun API ${res.status}: ${body}`);

    const parsed = JSON.parse(body) as { id?: string };
    return { messageId: parsed.id || 'mailgun', accepted: true };
  }
}