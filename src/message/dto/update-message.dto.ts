import { IsOptional, IsUUID, IsString, IsBoolean } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUUID()
  channelId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  workspaceId?: string;

  @IsOptional()
  @IsUUID()
  parentMessageId?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
