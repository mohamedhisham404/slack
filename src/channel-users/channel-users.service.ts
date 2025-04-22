import { Injectable } from '@nestjs/common';
import { CreateChannelUsersDto } from './dto/create-channel-user.dto';
import { UpdateChannelUsersDto } from './dto/update-channel-user.dto';

@Injectable()
export class ChannelUsersService {
  create(createChannelUserDto: CreateChannelUsersDto) {
    return 'This action adds a new channelUser';
  }

  findAll() {
    return `This action returns all channelUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} channelUser`;
  }

  update(id: number, updateChannelUserDto: UpdateChannelUsersDto) {
    return `This action updates a #${id} channelUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} channelUser`;
  }
}
