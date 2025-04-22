import { IsNumber } from 'class-validator';

export class CreateMessageEmojiDto {
  @IsNumber() message_id: number;
  @IsNumber() emoji_id: number;
  @IsNumber() user_id: number;
}
