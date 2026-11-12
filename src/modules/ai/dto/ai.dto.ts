import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiChatDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiProperty({ example: 'Explain Serializable Snapshot Isolation vs Two-Phase Locking' })
  @IsString()
  @IsNotEmpty()
  prompt!: string;
}

export class GenerateAiStudyPlanDto {
  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiProperty()
  @IsDateString()
  endDate!: string;

  @ApiProperty({ example: 90 })
  @IsInt()
  @Min(15)
  @Max(600)
  dailyAvailableMinutes!: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  subjectIds?: string[];

  @ApiProperty({ example: 'Prepare for Distributed Systems Midterm' })
  @IsString()
  @IsNotEmpty()
  goalFocus!: string;
}

export class AiSummarizeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class AiExplainTopicDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  topicTitle!: string;

  @ApiPropertyOptional({ example: 'UNDERGRADUATE' })
  @IsOptional()
  @IsString()
  academicLevel?: string;
}
