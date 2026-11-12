import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutSessionDto {
  @ApiProperty({ example: 'PRO_MONTHLY' })
  @IsString()
  @IsNotEmpty()
  planCode!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;
}
