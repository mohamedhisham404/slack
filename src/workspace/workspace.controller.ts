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
  ParseIntPipe,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guards';
import { AddUserDto } from './dto/add-user.dto';

@UseGuards(AuthGuard)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  async create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @Req() req: Request,
  ) {
    return this.workspaceService.create(createWorkspaceDto, req);
  }

  @Post('/add_user')
  async addUser(@Body() addUser: AddUserDto, @Req() req: Request) {
    return this.workspaceService.addUser(addUser, req);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workspaceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @Req() req: Request,
  ) {
    return this.workspaceService.update(id, updateWorkspaceDto, req);
  }

  @Delete(':workspace_id/user/:user_id')
  async removeUser(
    @Param('workspace_id', ParseIntPipe) workspace_id: number,
    @Param('user_id', ParseIntPipe) user_id: number,
    @Req() req: Request,
  ) {
    return this.workspaceService.removeUser(workspace_id, user_id, req);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.workspaceService.remove(id, req);
  }

  @Get(':workspace_id/users')
  async getUsers(
    @Param('workspace_id', ParseIntPipe) workspace_id: number,
    @Req() req: Request,
  ) {
    return this.workspaceService.getUsers(workspace_id, req);
  }
}
