import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'student@studypilot.io' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass#2026!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain uppercase, lowercase, and numeric characters',
  })
  password!: string;

  @ApiProperty({ example: 'Arjun' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({ example: 'Asia/Kolkata' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'student@studypilot.io' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass#2026!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ example: 'browser-extension-popup' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ example: 'Chrome Extension SidePanel on Linux' })
  @IsOptional()
  @IsString()
  deviceName?: string;
}

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description:
      'Refresh token supplied by non-browser clients. Browser clients use the httpOnly refresh cookie instead.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  refreshToken?: string;

  @ApiPropertyOptional({ example: 'web-app' })
  @IsOptional()
  @IsString()
  clientId?: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}

export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;
}
export class ResendVerificationDto {
  @ApiProperty({
    example: 'student@studypilot.io',
    description: 'Email address of the registered account',
  })
  @IsEmail()
  email!: string;
}
