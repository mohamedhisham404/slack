import { IsNumber } from 'class-validator';

export class CreateMessageReactionDto {
  @IsNumber()
  messageId: number;

  @IsNumber()
  emojyId: number;
}
