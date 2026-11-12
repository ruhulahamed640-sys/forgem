import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExamSubjectInputDto {
  @ApiProperty()
  @IsUUID()
  subjectId!: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  maxMarks!: number;

  @ApiProperty({ example: 40 })
  @IsNumber()
  passingMarks!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  examDate?: string;
}

export class CreateExamDto {
  @ApiProperty({ example: 'Fall Semester Final Examination' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'FINAL' })
  @IsOptional()
  @IsString()
  examType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiProperty()
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ type: [ExamSubjectInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamSubjectInputDto)
  subjects?: ExamSubjectInputDto[];
}

export class SubjectMarkEntryDto {
  @ApiProperty()
  @IsUUID()
  subjectId!: string;

  @ApiProperty()
  @IsNumber()
  marksObtained!: number;

  @ApiProperty()
  @IsNumber()
  maxMarks!: number;
}

export class RecordExamResultsDto {
  @ApiProperty({ type: [SubjectMarkEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectMarkEntryDto)
  marks!: SubjectMarkEntryDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}
