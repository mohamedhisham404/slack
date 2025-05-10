import { IsEnum, IsUUID } from 'class-validator';
import { ChannelRole } from '../enums/channel-role.enum';

export class AddUserDto {
  @IsUUID() channelId: string;
  @IsUUID() userId: string;
  @IsEnum(ChannelRole) role?: ChannelRole;
}
