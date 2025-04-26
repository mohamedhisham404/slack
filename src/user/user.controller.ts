import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
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
    @Param('channelId') channelId: string,
    @Req() req: Request,
  ) {
    return this.userService.findAllUsersInChannel(+channelId, req);
  }

  @Get('workspace/:workspaceId')
  async findAllUsersInWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Req() req: Request,
  ) {
    return this.userService.findAllUsersInWorkspace(+workspaceId, req);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    return this.userService.update(+id, updateUserDto, req);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.userService.remove(+id, req);
  }
}
