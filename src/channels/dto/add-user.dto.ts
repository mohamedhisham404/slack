import { IsEnum, IsNumber } from 'class-validator';
import { ChannelRole } from '../enums/channel-role.enum';

export class AddUserDto {
  @IsNumber() channel_id: number;
  @IsNumber() user_id: number;
  @IsEnum(ChannelRole) role?: ChannelRole;
}
