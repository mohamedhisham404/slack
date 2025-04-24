import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { CreateAttachmentDto } from 'src/attachment/dto/create-attachment.dto';

export class CreateMessageDto {
  @IsOptional() @IsString() content?: string;

  @IsNumber() user_id: number;
  @IsNumber() channel_id: number;

  @IsOptional() @IsNumber() parent_message?: number;
  @IsOptional() @IsBoolean() is_pinned?: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentDto)
  attachments?: CreateAttachmentDto[];
}
