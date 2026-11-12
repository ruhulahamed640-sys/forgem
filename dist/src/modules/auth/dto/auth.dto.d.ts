export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    timezone?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
    clientId?: string;
    deviceName?: string;
}
export declare class RefreshTokenDto {
    refreshToken?: string;
    clientId?: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class VerifyEmailDto {
    token: string;
}
export declare class ResendVerificationDto {
    email: string;
}
