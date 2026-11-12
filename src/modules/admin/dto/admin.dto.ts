import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AccountStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: AccountStatus })
  @IsEnum(AccountStatus)
  status!: AccountStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateSystemSettingDto {
  @ApiProperty({ example: 'platform.maintenance_mode' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty()
  value!: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
