import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RefreshTokenDto, RegisterDto, ResetPasswordDto, VerifyEmailDto, ResendVerificationDto } from './dto/auth.dto';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    private setRefreshCookie;
    private clearRefreshCookie;
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
    login(dto: LoginDto, req: Request, res: Response): Promise<{
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
    logout(user: AuthenticatedUser, res: Response, allDevices?: string): Promise<{
        loggedOut: boolean;
        scope: string;
    }>;
    refresh(dto: RefreshTokenDto, req: Request, res: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        sessionId: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto, req: Request): Promise<{
        _testResetToken?: string | undefined;
        resetEmailDispatched: boolean;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        passwordReset: boolean;
        allSessionsRevoked: boolean;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        emailVerified: boolean;
    }>;
    resendVerification(dto: ResendVerificationDto): Promise<{
        _testVerificationToken?: string | undefined;
        verificationSent: boolean;
    }>;
    getMe(user: AuthenticatedUser): AuthenticatedUser;
    listSessions(user: AuthenticatedUser): Promise<{
        id: string;
        createdAt: Date;
        clientId: string;
        deviceName: string | null;
        ipAddress: string | null;
        lastActiveAt: Date;
        expiresAt: Date;
    }[]>;
    revokeSession(user: AuthenticatedUser, sessionId: string): Promise<{
        sessionRevoked: boolean;
        sessionId: string;
    }>;
}
