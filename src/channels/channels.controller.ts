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
  ParseUUIDPipe,
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
    @Body() createChanneslDto: CreateChannelsDto,
    @Req() req: Request,
  ) {
    return this.channelsService.create(createChanneslDto, req);
  }

  @Post('user')
  async addUser(@Body() addUser: AddUserDto, @Req() req: Request) {
    return this.channelsService.addUser(addUser, req);
  }

  @Get('participating/:workspaceId')
  async findAllParticipatingChannelsInWorkspace(
    @Req() req: Request,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
  ) {
    return this.channelsService.findAllParticipatingChannelsInWorkspace(
      workspaceId,
      req,
    );
  }

  @Get('workspace/:workspaceId')
  async findAllByWorkspace(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Req() req: Request,
  ) {
    return this.channelsService.findAllByWorkspace(workspaceId, req);
  }

  @Get(':channelId')
  async findOne(
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Req() req: Request,
  ) {
    return this.channelsService.findOneByWorkspace(channelId, req);
  }

  @Get('dm/workspace/:workspaceId')
  async findAllDM(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Req() req: Request,
  ) {
    return this.channelsService.findAllDM(workspaceId, req);
  }

  @Get('dm/:DMId/workspace/:workspaceId')
  async findOneDM(
    @Param('DMId', new ParseUUIDPipe()) DMId: string,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Req() req: Request,
  ) {
    return this.channelsService.findOneDM(DMId, workspaceId, req);
  }

  @Patch(':channelId')
  async update(
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Body() updateChannelDto: UpdateChannelsDto,
    @Req() req: Request,
  ) {
    return this.channelsService.update(channelId, updateChannelDto, req);
  }

  @Delete(':channelId/user/:userId')
  async removeUser(
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Req() req: Request,
  ) {
    return this.channelsService.removeUser(channelId, userId, req);
  }

  @Delete(':channelId')
  async remove(
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Req() req: Request,
  ) {
    return this.channelsService.remove(channelId, req);
  }
}
