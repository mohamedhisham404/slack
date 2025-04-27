import { IsNumber, IsString } from 'class-validator';

export class CreateEmojyDto {
  @IsString() unicode: string;
  @IsString() name: string;
  @IsNumber()
  channelId: number;
}
