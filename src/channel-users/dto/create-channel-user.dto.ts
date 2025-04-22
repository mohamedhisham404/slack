import { IsEnum, IsNumber } from 'class-validator';

export class CreateChannelUsersDto {
  @IsNumber() user_id: number;
  @IsNumber() channel_id: number;

  @IsEnum(['admin', 'member'])
  role: 'admin' | 'member';
}
