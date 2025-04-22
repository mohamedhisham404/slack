import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageEmojiDto } from './create-message-emoji.dto';

export class UpdateMessageEmojiDto extends PartialType(CreateMessageEmojiDto) {}
