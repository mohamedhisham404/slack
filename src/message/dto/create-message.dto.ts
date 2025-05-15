import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  Validate,
} from 'class-validator';
import { IsChannelOrWorkspaceWithUserConstraint } from './validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsUUID()
  @IsOptional()
  channelId?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsUUID()
  @IsOptional()
  workspaceId?: string;

  @IsOptional()
  @IsUUID()
  parentMessageId?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @Validate(IsChannelOrWorkspaceWithUserConstraint)
  dummyProperty: boolean = true;
}
