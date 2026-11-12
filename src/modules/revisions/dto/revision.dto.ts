import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { SpacedRepetitionAlgorithm } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRevisionDto {
  @ApiProperty()
  @IsUUID()
  topicId!: string;

  @ApiPropertyOptional({ enum: SpacedRepetitionAlgorithm })
  @IsOptional()
  @IsEnum(SpacedRepetitionAlgorithm)
  algorithm?: SpacedRepetitionAlgorithm;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}

export class CompleteRevisionDto {
  @ApiProperty({ description: 'Difficulty rating from 1 (very easy) to 5 (very hard)', example: 2 })
  @IsInt()
  @Min(1)
  @Max(5)
  difficultyRating!: number;

  @ApiProperty({ description: 'Duration of revision session in minutes', example: 25 })
  @IsInt()
  @Min(1)
  @Max(480)
  durationMinutes!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
