import { IsBoolean, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateNotificationWorkspaceDto {
  @IsNumber() user_id: number;
  @IsNumber() workspace_id: number;

  @IsOptional() @IsBoolean() admin_notifications?: boolean;
  @IsOptional() @IsBoolean() huddle_notifications?: boolean;

  @IsOptional() @IsDateString() start_time?: string;
  @IsOptional() @IsDateString() end_time?: string;
}
