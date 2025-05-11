import { IsBoolean, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateNotificationWorkspaceDto {
  @IsUUID() userId: string;
  @IsUUID() workspaceId: string;

  @IsOptional() @IsBoolean() admin_notifications?: boolean;
  @IsOptional() @IsBoolean() huddle_notifications?: boolean;

  @IsOptional() @IsDateString() start_time?: string;
  @IsOptional() @IsDateString() end_time?: string;
}
