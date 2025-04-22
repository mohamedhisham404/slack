import { Injectable } from '@nestjs/common';
import { CreateChannelsDto } from './dto/create-channel.dto';
import { UpdateChannelsDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelsService {
  create(createChannelDto: CreateChannelsDto) {
    return 'This action adds a new channel';
  }

  findAll() {
    return `This action returns all channels`;
  }

  findOne(id: number) {
    return `This action returns a #${id} channel`;
  }

  update(id: number, updateChannelDto: UpdateChannelsDto) {
    return `This action updates a #${id} channel`;
  }

  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}
