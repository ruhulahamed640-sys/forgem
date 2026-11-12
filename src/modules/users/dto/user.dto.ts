import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SpacedRepetitionAlgorithm } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(960)
  dailyStudyTargetMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(6720)
  weeklyStudyTargetMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(120)
  pomodoroWorkMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(60)
  pomodoroBreakMinutes?: number;

  @IsOptional()
  @IsEnum(SpacedRepetitionAlgorithm)
  spacedRepetitionAlgorithm?: SpacedRepetitionAlgorithm;

  @IsOptional()
  @IsBoolean()
  leaderboardOptIn?: boolean;

  @IsOptional()
  @IsBoolean()
  extensionSyncEnabled?: boolean;
}
