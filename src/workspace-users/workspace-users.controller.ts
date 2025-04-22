import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WorkspaceUsersService } from './workspace-users.service';
import { CreateWorkspaceUsersDto } from './dto/create-workspace-user.dto';
import { UpdateWorkspaceUsersDto } from './dto/update-workspace-user.dto';

@Controller('workspace-users')
export class WorkspaceUsersController {
  constructor(private readonly workspaceUsersService: WorkspaceUsersService) {}

  @Post()
  create(@Body() createWorkspaceUserDto: CreateWorkspaceUsersDto) {
    return this.workspaceUsersService.create(createWorkspaceUserDto);
  }

  @Get()
  findAll() {
    return this.workspaceUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workspaceUsersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceUserDto: UpdateWorkspaceUsersDto,
  ) {
    return this.workspaceUsersService.update(+id, updateWorkspaceUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workspaceUsersService.remove(+id);
  }
}
