
import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SmtpEmailProvider } from '../../integrations/email/smtp-email.provider';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, SmtpEmailProvider],
  exports: [AuthService, SmtpEmailProvider],
})
export class AuthModule {}
