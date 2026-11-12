import { PrismaService } from '../../database/prisma/prisma.service';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { SmtpEmailProvider } from '../../integrations/email/smtp-email.provider';
export declare class AuthService {
    private readonly prisma;
    private readonly emailProvider;
    private readonly accessSecret;
    private readonly logger;
    constructor(prisma: PrismaService, emailProvider: SmtpEmailProvider);
    private dispatchEmail;
    hashPassword(password: string): string;
    verifyPassword(password: string, storedHash: string): boolean;
    hashOpaqueToken(rawToken: string): string;
    signAccessToken(payload: AuthenticatedUser, expiresInSeconds?: number): string;
    verifyAccessTokenSignature(token: string): AuthenticatedUser & {
        exp: number;
    };
    verifyAccessTokenAndSession(token: string): Promise<AuthenticatedUser>;
    register(dto: RegisterDto): Promise<{
        _testVerificationToken?: string | undefined;
        user: {
            id: string;
            email: string;
            status: import(".prisma/client").$Enums.AccountStatus;
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                displayName: string | null;
                avatarStorageKey: string | null;
                bio: string | null;
                dateOfBirth: Date | null;
                phone: string | null;
                timezone: string;
                locale: string;
                institutionId: string | null;
                classId: string | null;
                academicYearId: string | null;
                userId: string;
            } | null;
            roles: import(".prisma/client").$Enums.RoleName[];
        };
        verificationTokenIssued: boolean;
    }>;
    login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        clientId: string;
        sessionId: string;
        user: {
            id: string;
            email: string;
            status: "ACTIVE" | "PENDING_VERIFICATION";
            roles: import(".prisma/client").$Enums.RoleName[];
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                displayName: string | null;
                avatarStorageKey: string | null;
                bio: string | null;
                dateOfBirth: Date | null;
                phone: string | null;
                timezone: string;
                locale: string;
                institutionId: string | null;
                classId: string | null;
                academicYearId: string | null;
                userId: string;
            } | null;
        };
    }>;
    refreshTokens(refreshToken?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        sessionId: string;
    }>;
    logout(userId: string, sessionId: string, allDevices?: boolean): Promise<{
        loggedOut: boolean;
        scope: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        emailVerified: boolean;
    }>;
    resendVerification(email: string): Promise<{
        _testVerificationToken?: string | undefined;
        verificationSent: boolean;
    }>;
    forgotPassword(dto: ForgotPasswordDto, ipAddress?: string): Promise<{
        _testResetToken?: string | undefined;
        resetEmailDispatched: boolean;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        passwordReset: boolean;
        allSessionsRevoked: boolean;
    }>;
    listSessions(userId: string): Promise<{
        id: string;
        createdAt: Date;
        clientId: string;
        deviceName: string | null;
        ipAddress: string | null;
        lastActiveAt: Date;
        expiresAt: Date;
    }[]>;
    revokeSession(userId: string, sessionId: string): Promise<{
        sessionRevoked: boolean;
        sessionId: string;
    }>;
}
