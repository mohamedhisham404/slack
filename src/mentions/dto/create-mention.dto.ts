import { IsNumber } from 'class-validator';

export class CreateMentionsDto {
  @IsNumber() user_id: number;
  @IsNumber() message_id: number;
}
