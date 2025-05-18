import { IsEnum, IsUUID } from 'class-validator';
import { AttachmentType } from '../types/attachment.type';

export class CreateAttachmentDto {
  @IsUUID() channelId: string;

  @IsEnum(['image', 'video', 'file', 'audio'])
  type: AttachmentType;
}
