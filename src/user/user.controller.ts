import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guards';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('channel/:channelId')
  async findAllUsersInChannel(
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Req() req: Request,
  ) {
    return this.userService.findAllUsersInChannel(channelId, req);
  }

  @Get('workspace/:workspaceId')
  async findAllUsersInWorkspace(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Req() req: Request,
  ) {
    return this.userService.findAllUsersInWorkspace(workspaceId, req);
  }

  @Get(':userId')
  async findOne(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.userService.findOne(userId);
  }

  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    return this.userService.update(updateUserDto, req);
  }

  @Delete()
  async remove(@Req() req: Request) {
    return this.userService.remove(req);
  }
}
