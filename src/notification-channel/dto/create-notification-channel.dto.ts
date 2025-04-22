import { IsBoolean, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateNotificationChannelDto {
  @IsNumber() user_id: number;
  @IsNumber() channel_id: number;

  @IsOptional() @IsBoolean() VIP_notifications?: boolean;
  @IsOptional() @IsBoolean() huddle_notifications?: boolean;

  @IsOptional() @IsDateString() start_time?: string;
  @IsOptional() @IsDateString() end_time?: string;
}
