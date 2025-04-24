import { IsEnum, IsNumber } from 'class-validator';
import { ChannelRole } from '../entities/user-channel.entity';

export class AddUserDto {
  @IsNumber() channel_id: number;
  @IsNumber() user_id: number;
  @IsEnum(ChannelRole) role?: string;
}
