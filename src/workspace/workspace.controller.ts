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
  async findOne(@Param('id') id: string) {
    return this.workspaceService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @Req() req: Request,
  ) {
    return this.workspaceService.update(+id, updateWorkspaceDto, req);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.workspaceService.remove(+id, req);
  }
}
