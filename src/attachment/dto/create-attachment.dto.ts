import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateAttachmentDto {
  @IsNumber() message_id: number;
  @IsString() title: string;

  @IsEnum(['image', 'video', 'file', 'link'])
  type: 'image' | 'video' | 'file' | 'link';

  @IsNumber() size: number;
  @IsString() url: string;
}
