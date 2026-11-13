import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Operating Systems & Concurrency', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({ example: 'CS-301', maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  code?: string;

  @ApiPropertyOptional({ example: '#2563EB', maxLength: 16 })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  colorHex?: string;

  @ApiPropertyOptional({ example: 'atom', maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  icon?: string;

  @ApiPropertyOptional({ example: 240 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(3000)
  targetWeeklyMinutes?: number;
}

export class UpdateSubjectDto {
  @ApiPropertyOptional({ example: 'Operating Systems', maxLength: 150 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ example: 'CS-301', maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  code?: string;

  @ApiPropertyOptional({ example: '#2563EB', maxLength: 16 })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  colorHex?: string;

  @ApiPropertyOptional({ example: 'atom', maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  icon?: string;

  @ApiPropertyOptional({ example: 240 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(3000)
  targetWeeklyMinutes?: number;

  @ApiPropertyOptional({ example: true, description: 'Archive or restore the subject' })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
