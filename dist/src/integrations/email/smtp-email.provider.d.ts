import { ConfigService } from '@nestjs/config';
export interface EmailPayload {
    to: string;
    subject: string;
    htmlBody: string;
    text?: string;
}
export declare class SmtpEmailProvider {
    private readonly config;
    private readonly logger;
    private readonly transporter;
    constructor(config: ConfigService);
    sendEmail(payload: EmailPayload): Promise<{
        messageId: string;
        accepted: boolean;
    }>;
    sendVerificationEmail(to: string, token: string): Promise<{
        messageId: string;
        accepted: boolean;
    }>;
    sendPasswordResetEmail(to: string, token: string): Promise<{
        messageId: string;
        accepted: boolean;
    }>;
}
