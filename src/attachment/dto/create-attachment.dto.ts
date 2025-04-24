import { IsEnum, IsNumber, IsString } from 'class-validator';
import { AttachmentType } from '../entities/attachment.entity';

export class CreateAttachmentDto {
  @IsNumber() message_id: number;
  @IsString() title: string;

  @IsEnum(['image', 'video', 'file', 'link'])
  type: AttachmentType;

  @IsNumber() size: number;
  @IsString() url: string;
}
