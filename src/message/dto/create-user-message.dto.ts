import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateAttachmentDto } from 'src/attachment/dto/create-attachment.dto';

export class CreateUserMessageDTO {
  @IsOptional() @IsString() content?: string;

  @IsNumber() receiver_id: number;

  @IsOptional() @IsNumber() parent_message_id?: number;
  @IsOptional() @IsBoolean() is_pinned?: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentDto)
  attachments?: CreateAttachmentDto[];
}
