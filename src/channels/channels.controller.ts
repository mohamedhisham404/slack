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

  @Post('user')
  async addUser(@Body() addUser: AddUserDto, @Req() req: Request) {
    return this.channelsService.addUser(addUser, req);
  }

  @Get('workspace/:workspace_id')
  async findAllByWorkspace(
    @Param('workspace_id') workspace_id: string,
    @Req() req: Request,
  ) {
    return this.channelsService.findAllByWorkspace(+workspace_id, req);
  }

  @Get(':channelid/workspace/:workspaceid')
  async findOneByWorkspace(
    @Param('channelid') channelid: string,
    @Param('workspaceid') workspaceid: string,
    @Req() req: Request,
  ) {
    return this.channelsService.findOneByWorkspace(
      +channelid,
      +workspaceid,
      req,
    );
  }

  @Get('dm')
  async findAllDM(@Req() req: Request) {
    return this.channelsService.findAllDM(req);
  }

  @Get('dm/:id')
  async findOneDM(@Param('id') id: string, @Req() req: Request) {
    return this.channelsService.findOneDM(+id, req);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChannelDto: UpdateChannelsDto,
    @Req() req: Request,
  ) {
    return this.channelsService.update(+id, updateChannelDto, req);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.channelsService.remove(+id, req);
  }
}
