import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseIntPipe,
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
    @Param('channelId', ParseIntPipe) channelId: number,
    @Req() req: Request,
  ) {
    return this.userService.findAllUsersInChannel(channelId, req);
  }

  @Get('workspace/:workspaceId')
  async findAllUsersInWorkspace(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Req() req: Request,
  ) {
    return this.userService.findAllUsersInWorkspace(workspaceId, req);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    return this.userService.update(id, updateUserDto, req);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.userService.remove(id, req);
  }
}
