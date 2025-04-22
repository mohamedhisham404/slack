import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateMessageDto {
  @IsOptional() @IsString() content?: string;

  @IsNumber() user_id: number;
  @IsNumber() channel_id: number;

  @IsOptional() @IsNumber() parent_message?: number;
  @IsOptional() @IsBoolean() is_pinned?: boolean;
}
