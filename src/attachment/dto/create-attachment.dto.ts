import { IsEnum, IsString, IsUUID } from 'class-validator';
import { AttachmentType } from '../types/attachment.type';

export class CreateAttachmentDto {
  @IsUUID() channelId: string;

  @IsString() title: string;

  @IsEnum(['image', 'video', 'file', 'audio'])
  type: AttachmentType;
}
