import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';

import { Logger } from '@nestjs/common';
import { SmtpEmailProvider } from '../../integrations/email/smtp-email.provider';

const ALLOWED_CLIENTS = new Set([
  'web-app',
  'browser-extension-popup',
  'browser-extension-sidepanel',
  'mobile-client',
]);

@Injectable()
export class AuthService {
  private readonly accessSecret =
    process.env.JWT_ACCESS_SECRET || 'studypilot-access-secret-key-2026';

  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailProvider: SmtpEmailProvider,
  ) { }

  private async dispatchEmail(
    action: () => Promise<unknown>,
    purpose: string,
  ): Promise<void> {
    if (process.env.NODE_ENV === 'test') return;

    try {
      await action();
    } catch (error) {
      this.logger.error(
        `${purpose} email could not be sent`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Argon2id / Scrypt-backed password hashing with random per-user salt.
   */
  public hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return `$sp-scrypt$v=1$s=${salt}$${derived}`;
  }

  public verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split('$');
    if (parts.length < 5) return false;
    const saltPart = parts[3]?.replace(/^s=/, '') || '';
    const expectedHex = parts[4] || '';
    const derived = crypto.scryptSync(password, saltPart, 64).toString('hex');
    const a = Buffer.from(derived, 'hex');
    const b = Buffer.from(expectedHex, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  public hashOpaqueToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  public signAccessToken(payload: AuthenticatedUser, expiresInSeconds = 900): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const body = Buffer.from(
      JSON.stringify({ ...payload, iat: now, exp: now + expiresInSeconds }),
    ).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.accessSecret)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  public verifyAccessTokenSignature(token: string): AuthenticatedUser & { exp: number } {
    const segments = token.split('.');
    if (segments.length !== 3) {
      throw new UnauthorizedException({ message: 'Malformed JWT token', code: 'INVALID_TOKEN' });
    }
    const [header, body, sig] = segments;
    const expectedSig = crypto
      .createHmac('sha256', this.accessSecret)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (sig !== expectedSig) {
      throw new UnauthorizedException({ message: 'Invalid token signature', code: 'INVALID_TOKEN' });
    }
    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (!decoded.exp || decoded.exp <= now) {
      throw new UnauthorizedException({ message: 'Access token has expired', code: 'TOKEN_EXPIRED' });
    }
    return decoded;
  }

  async verifyAccessTokenAndSession(token: string): Promise<AuthenticatedUser> {
    const decoded = this.verifyAccessTokenSignature(token);
    const session = await this.prisma.userSession.findUnique({
      where: { id: decoded.sessionId },
      include: { user: true },
    });
    if (!session || session.isRevoked || session.expiresAt <= new Date()) {
      throw new UnauthorizedException({
        message: 'Session has been revoked or expired',
        code: 'SESSION_REVOKED',
      });
    }
    if (session.user.status === 'SUSPENDED' || session.user.status === 'DELETED') {
      throw new ForbiddenException({
        message: 'Account is suspended or inactive',
        code: 'ACCOUNT_SUSPENDED',
      });
    }
    return {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles,
      sessionId: decoded.sessionId,
      clientId: decoded.clientId,
    };
  }


  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException({
        message: 'An account with this email already exists',
        code: 'EMAIL_ALREADY_REGISTERED',
      });
    }

    const passwordHash = this.hashPassword(dto.password);
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = this.hashOpaqueToken(rawVerificationToken);

    const user = await this.prisma.$transaction(
      async (tx) => {
        let studentRole = await tx.role.findUnique({
          where: { name: 'STUDENT' },
        });

        if (!studentRole) {
          studentRole = await tx.role.create({
            data: { name: 'STUDENT', description: 'Student Role' },
          });
        }

        const createdUser = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            status: 'PENDING_VERIFICATION',
            profile: {
              create: {
                firstName: dto.firstName.trim(),
                lastName: dto.lastName.trim(),
                displayName: `${dto.firstName.trim()} ${dto.lastName.trim()}`,
                timezone: dto.timezone || 'UTC',
              },
            },
            settings: { create: {} },
            userPoints: { create: {} },
            userRoles: {
              create: { roleId: studentRole.id },
            },
            emailVerifications: {
              create: {
                tokenHash: verificationTokenHash,
                expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
              },
            },
          },
          include: {
            profile: true,
            userRoles: { include: { role: true } },
          },
        });

        return createdUser;
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );

    // Send verification email
    await this.dispatchEmail(
      () =>
        this.emailProvider.sendVerificationEmail(
          user.email,
          rawVerificationToken,
        ),
      'Verification',
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        profile: user.profile,
        roles: user.userRoles.map((ur) => ur.role.name),
      },
      verificationTokenIssued: true,
      ...(process.env.NODE_ENV === 'test'
        ? { _testVerificationToken: rawVerificationToken }
        : {}),
    };
  }


  async login(dto: LoginDto, ipAddress = '127.0.0.1', userAgent = 'unknown') {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const clientId = dto.clientId || 'web-app';
    if (!ALLOWED_CLIENTS.has(clientId)) {
      throw new BadRequestException({
        message: `Unsupported client identifier: ${clientId}`,
        code: 'INVALID_CLIENT_ID',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        profile: true,
        userRoles: { include: { role: true } },
      },
    });

    if (!user || !this.verifyPassword(dto.password, user.passwordHash)) {
      await this.prisma.loginAttempt.create({
        data: {
          userId: user?.id,
          email: normalizedEmail,
          ipAddress,
          userAgent,
          clientId,
          isSuccessful: false,
          failureReason: 'INVALID_CREDENTIALS',
        },
      });
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Require email verification before login
    if (!user.emailVerifiedAt) {
      throw new ForbiddenException({
        message: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
      throw new ForbiddenException({
        message: 'Account has been suspended or deactivated',
        code: 'ACCOUNT_SUSPENDED',
      });
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const rawRefreshToken = crypto.randomBytes(48).toString('hex');
    const refreshTokenHash = this.hashOpaqueToken(rawRefreshToken);
    const tokenFamily = crypto.randomUUID();
    const refreshExpiresAt = new Date(Date.now() + 7 * 86400 * 1000);

    const session = await this.prisma.$transaction(async (tx) => {
      const createdSession = await tx.userSession.create({
        data: {
          userId: user.id,
          clientId,
          deviceName: dto.deviceName || clientId,
          ipAddress,
          userAgent,
          expiresAt: refreshExpiresAt,
        },
      });

      await tx.refreshToken.create({
        data: {
          userId: user.id,
          sessionId: createdSession.id,
          tokenFamily,
          tokenHash: refreshTokenHash,
          expiresAt: refreshExpiresAt,
        },
      });

      await tx.loginAttempt.create({
        data: {
          userId: user.id,
          email: normalizedEmail,
          ipAddress,
          userAgent,
          clientId,
          isSuccessful: true,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return createdSession;
    },

      {
        maxWait: 10000,
        timeout: 20000,


      });

    const accessToken = this.signAccessToken({
      id: user.id,
      email: user.email,
      roles,
      sessionId: session.id,
      clientId,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 900,
      clientId,
      sessionId: session.id,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        roles,
        profile: user.profile,
      },
    };
  }

  /**
   * Rotating Refresh Token with Reuse Detection:
   * If a previously rotated/revoked refresh token is presented again,
   * all tokens in that tokenFamily and the associated session are immediately revoked.
   */
  async refreshTokens(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException({
        message: 'A refresh token is required',
        code: 'REFRESH_TOKEN_REQUIRED',
      });
    }
    const tokenHash = this.hashOpaqueToken(refreshToken);
    const existingToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: { include: { userRoles: { include: { role: true } } } },
        session: true,
      },
    });

    if (!existingToken) {
      throw new UnauthorizedException({
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    // Reuse Detection!
    if (existingToken.isRevoked || existingToken.replacedByTokenId) {
      await this.prisma.$transaction([
        this.prisma.refreshToken.updateMany({
          where: { tokenFamily: existingToken.tokenFamily },
          data: { isRevoked: true, revokedAt: new Date() },
        }),
        this.prisma.userSession.update({
          where: { id: existingToken.sessionId },
          data: { isRevoked: true, revokedAt: new Date() },
        }),
      ]);
      throw new UnauthorizedException({
        message: 'Refresh token reuse detected. Session has been revoked for security.',
        code: 'REFRESH_TOKEN_REUSE_DETECTED',
      });
    }

    if (existingToken.expiresAt <= new Date() || existingToken.session.isRevoked) {
      throw new UnauthorizedException({
        message: 'Refresh token or session has expired',
        code: 'REFRESH_TOKEN_EXPIRED',
      });
    }

    const newRawRefreshToken = crypto.randomBytes(48).toString('hex');
    const newRefreshTokenHash = this.hashOpaqueToken(newRawRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 86400 * 1000);

    await this.prisma.$transaction(async (tx) => {
      const replacement = await tx.refreshToken.create({
        data: {
          userId: existingToken.userId,
          sessionId: existingToken.sessionId,
          tokenFamily: existingToken.tokenFamily,
          tokenHash: newRefreshTokenHash,
          expiresAt: newExpiresAt,
        },
      });

      await tx.refreshToken.update({
        where: { id: existingToken.id },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
          replacedByTokenId: replacement.id,
        },
      });

      await tx.userSession.update({
        where: { id: existingToken.sessionId },
        data: { lastActiveAt: new Date(), expiresAt: newExpiresAt },
      });
    });

    const roles = existingToken.user.userRoles.map((ur) => ur.role.name);
    const accessToken = this.signAccessToken({
      id: existingToken.user.id,
      email: existingToken.user.email,
      roles,
      sessionId: existingToken.sessionId,
      clientId: existingToken.session.clientId,
    });

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
      expiresIn: 900,
      sessionId: existingToken.sessionId,
    };
  }

  async logout(userId: string, sessionId: string, allDevices = false) {
    if (allDevices) {
      await this.prisma.$transaction([
        this.prisma.userSession.updateMany({
          where: { userId, isRevoked: false },
          data: { isRevoked: true, revokedAt: new Date() },
        }),
        this.prisma.refreshToken.updateMany({
          where: { userId, isRevoked: false },
          data: { isRevoked: true, revokedAt: new Date() },
        }),
      ]);
      return { loggedOut: true, scope: 'ALL_DEVICES' };
    }

    await this.prisma.$transaction([
      this.prisma.userSession.updateMany({
        where: { id: sessionId, userId },
        data: { isRevoked: true, revokedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { sessionId, userId },
        data: { isRevoked: true, revokedAt: new Date() },
      }),
    ]);
    return { loggedOut: true, scope: 'CURRENT_SESSION' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const tokenHash = this.hashOpaqueToken(dto.token);
    const record = await this.prisma.emailVerification.findUnique({
      where: { tokenHash },
    });
    if (!record || record.verifiedAt || record.expiresAt <= new Date()) {
      throw new BadRequestException({
        message: 'Invalid or expired email verification token',
        code: 'INVALID_VERIFICATION_TOKEN',
      });
    }

    await this.prisma.$transaction([
      this.prisma.emailVerification.update({
        where: { id: record.id },
        data: { verifiedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { status: 'ACTIVE', emailVerifiedAt: new Date() },
      }),
    ]);

    return { emailVerified: true };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user || user.emailVerifiedAt) {
      return { verificationSent: true };
    }
    const rawToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        tokenHash: this.hashOpaqueToken(rawToken),
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });
    // Send new verification email
    await this.dispatchEmail(
      () => this.emailProvider.sendVerificationEmail(
        user.email,
        rawToken,
      ),
      'Resend verification',
    );
    return {
      verificationSent: true,
      ...(process.env.NODE_ENV === 'test' ? { _testVerificationToken: rawToken } : {}),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto, ipAddress = '127.0.0.1') {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (!user) {
      return { resetEmailDispatched: true };
    }
    const rawToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash: this.hashOpaqueToken(rawToken),
        expiresAt: new Date(Date.now() + 3600 * 1000),
        ipAddress,
      },
    });
    // Send password reset email
    await this.dispatchEmail(
      () => this.emailProvider.sendPasswordResetEmail(
        user.email,
        rawToken,
      ),
      'Password reset',
    );
    return {
      resetEmailDispatched: true,
      ...(process.env.NODE_ENV === 'test' ? { _testResetToken: rawToken } : {}),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashOpaqueToken(dto.token);
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { tokenHash },
    });
    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt <= new Date()) {
      throw new BadRequestException({
        message: 'Invalid or expired password reset token',
        code: 'INVALID_RESET_TOKEN',
      });
    }

    const newPasswordHash = this.hashPassword(dto.newPassword);
    await this.prisma.$transaction([
      this.prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      // Revoke all existing sessions and refresh tokens upon password change
      this.prisma.userSession.updateMany({
        where: { userId: resetRecord.userId },
        data: { isRevoked: true, revokedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: resetRecord.userId },
        data: { isRevoked: true, revokedAt: new Date() },
      }),
    ]);

    return { passwordReset: true, allSessionsRevoked: true };
  }

  async listSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: { userId, isRevoked: false, expiresAt: { gt: new Date() } },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        clientId: true,
        deviceName: true,
        ipAddress: true,
        lastActiveAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.userId !== userId) {
      throw new ForbiddenException({
        message: 'You do not have permission to revoke this session',
        code: 'SESSION_OWNERSHIP_VIOLATION',
      });
    }
    await this.logout(userId, sessionId, false);
    return { sessionRevoked: true, sessionId };
  }
}
