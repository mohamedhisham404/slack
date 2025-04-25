import { IsEnum, IsNumber, IsString } from 'class-validator';
import { AttachmentType } from '../entities/attachment.entity';
import { Type } from 'class-transformer';

export class CreateAttachmentDto {
  @IsNumber() @Type(() => Number) message_id: number;
  @IsString() title: string;

  @IsEnum(['image', 'video', 'file', 'audio'])
  type: AttachmentType;
}
