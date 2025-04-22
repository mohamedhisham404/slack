import { Injectable } from '@nestjs/common';
import { CreateWorkspaceUsersDto } from './dto/create-workspace-user.dto';
import { UpdateWorkspaceUsersDto } from './dto/update-workspace-user.dto';

@Injectable()
export class WorkspaceUsersService {
  create(createWorkspaceUserDto: CreateWorkspaceUsersDto) {
    return 'This action adds a new workspaceUser';
  }

  findAll() {
    return `This action returns all workspaceUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workspaceUser`;
  }

  update(id: number, updateWorkspaceUserDto: UpdateWorkspaceUsersDto) {
    return `This action updates a #${id} workspaceUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} workspaceUser`;
  }
}
