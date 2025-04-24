import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelsDto } from './dto/create-channel.dto';
import { UpdateChannelsDto } from './dto/update-channel.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guards';
import { AddUserDto } from './dto/add-user.dto';

@UseGuards(AuthGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  async create(
    @Body() createChannelDto: CreateChannelsDto,
    @Req() req: Request,
  ) {
    return this.channelsService.create(createChannelDto, req);
  }

  @Post('/add_user')
  async addUser(@Body() addUser: AddUserDto, @Req() req: Request) {
    return this.channelsService.addUser(addUser, req);
  }

  @Get()
  findAll() {
    return this.channelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelsDto) {
    return this.channelsService.update(+id, updateChannelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelsService.remove(+id);
  }
}
