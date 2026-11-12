"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SmtpEmailProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpEmailProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let SmtpEmailProvider = SmtpEmailProvider_1 = class SmtpEmailProvider {
    config;
    logger = new common_1.Logger(SmtpEmailProvider_1.name);
    transporter;
    constructor(config) {
        this.config = config;
        this.transporter = nodemailer.createTransport({
            host: this.config.get('email.host'),
            port: this.config.get('email.port'),
            secure: this.config.get('email.secure'),
            auth: {
                user: this.config.get('email.user'),
                pass: this.config.get('email.password'),
            },
        });
    }
    async sendEmail(payload) {
        const from = this.config.get('email.from');
        if (!from || !this.config.get('email.user') ||
            !this.config.get('email.password')) {
            throw new common_1.InternalServerErrorException('SMTP configuration is incomplete');
        }
        try {
            const info = await this.transporter.sendMail({
                from: `"StudyPilot" <${from}>`,
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
        }
        catch (error) {
            this.logger.error(`Email delivery failed for ${payload.to}`, error instanceof Error ? error.stack : String(error));
            throw error;
        }
    }
    async sendVerificationEmail(to, token) {
        const frontendUrl = this.config.get('email.frontendUrl');
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
    async sendPasswordResetEmail(to, token) {
        const frontendUrl = this.config.get('email.frontendUrl');
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
};
exports.SmtpEmailProvider = SmtpEmailProvider;
exports.SmtpEmailProvider = SmtpEmailProvider = SmtpEmailProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmtpEmailProvider);
//# sourceMappingURL=smtp-email.provider.js.map