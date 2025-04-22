import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChannelUsersService } from './channel-users.service';
import { CreateChannelUsersDto } from './dto/create-channel-user.dto';
import { UpdateChannelUsersDto } from './dto/update-channel-user.dto';

@Controller('channel-users')
export class ChannelUsersController {
  constructor(private readonly channelUsersService: ChannelUsersService) {}

  @Post()
  create(@Body() createChannelUserDto: CreateChannelUsersDto) {
    return this.channelUsersService.create(createChannelUserDto);
  }

  @Get()
  findAll() {
    return this.channelUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelUsersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChannelUserDto: UpdateChannelUsersDto,
  ) {
    return this.channelUsersService.update(+id, updateChannelUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelUsersService.remove(+id);
  }
}
