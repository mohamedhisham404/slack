import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @ValidateIf((o: CreateMessageDto) => !o.userId)
  @IsUUID()
  channelId?: string;

  @ValidateIf((o: CreateMessageDto) => !o.channelId)
  @IsUUID()
  userId?: string;

  @ValidateIf((o: CreateMessageDto) => !!o.userId)
  @IsUUID()
  workspaceId?: string;

  @IsOptional()
  @IsUUID()
  parentMessageId?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
