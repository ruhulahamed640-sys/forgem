
import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SmtpEmailProvider } from '../../integrations/email/smtp-email.provider';
import { HttpEmailProvider } from '../../integrations/email/http-email.provider';
import { EmailRouter } from '../../integrations/email/email.router';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, SmtpEmailProvider, HttpEmailProvider, EmailRouter],
  exports: [AuthService, EmailRouter],
})
export class AuthModule {}
