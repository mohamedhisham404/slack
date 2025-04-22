import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelUsersDto } from './create-channel-user.dto';

export class UpdateChannelUsersDto extends PartialType(CreateChannelUsersDto) {}
