import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateChapterDto {
  @IsUUID()
  subjectId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsInt()
  @Min(1)
  orderIndex!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  estimatedMinutes?: number;
}

export class CreateTopicDto {
  @IsUUID()
  chapterId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsInt()
  @Min(1)
  orderIndex!: number;

  @IsOptional()
  @IsInt()
  difficultyLevel?: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
