import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RedeemRewardDto {
  @ApiProperty({ description: 'Client-generated idempotency key to prevent duplicate redemptions' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;
}

export class CreateRewardCatalogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  pointsCost!: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  stockQuantity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateRewardCatalogDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  pointsCost?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;
}
