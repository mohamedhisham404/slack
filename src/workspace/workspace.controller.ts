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

  @Get(':workspaceId')
  async findOne(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Req() req: Request,
  ) {
    return this.workspaceService.findOne(workspaceId, req);
  }

  @Get()
  async getAllUsersWorkspaces(@Req() req: Request) {
    return this.workspaceService.getAllUsersWorkspaces(req);
  }

  @Patch(':workspaceId')
  update(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @Req() req: Request,
  ) {
    return this.workspaceService.update(workspaceId, updateWorkspaceDto, req);
  }

  @Delete(':workspaceId/user/:userId')
  async removeUser(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Req() req: Request,
  ) {
    return this.workspaceService.removeUser(workspaceId, userId, req);
  }

  @Delete(':workspaceId')
  async remove(
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Req() req: Request,
  ) {
    return this.workspaceService.remove(workspaceId, req);
  }
}
