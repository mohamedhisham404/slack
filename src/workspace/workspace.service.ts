import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { Repository } from 'typeorm';
import { UserWorkspace, workspaceRole } from './entities/user-workspace.entity';
import { Request } from 'express';
import { Channels } from 'src/channels/entities/channel.entity';
import {
  ChannelRole,
  UserChannel,
} from 'src/channels/entities/user-channel.entity';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workSpaceRepo: Repository<Workspace>,

    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepo: Repository<UserWorkspace>,

    @InjectRepository(Channels)
    private readonly channelRepo: Repository<Channels>,

    @InjectRepository(UserChannel)
    private readonly userChannelRepo: Repository<UserChannel>,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, req: Request) {
    try {
      const userId = req.user.userId;

      const workspace = this.workSpaceRepo.create({
        name: createWorkspaceDto.name,
      });
      const savedWorkspace = await this.workSpaceRepo.save(workspace);

      const userWorkspace = this.userWorkspaceRepo.create({
        workspace: savedWorkspace,
        user: { id: userId },
        role: workspaceRole.ADMIN,
      });
      await this.userWorkspaceRepo.save(userWorkspace);

      const channel = this.channelRepo.create({
        name: 'general',
        workspace: savedWorkspace,
        created_by: userId,
      });
      await this.channelRepo.save(channel);

      const userChannel = this.userChannelRepo.create({
        channel: channel,
        user: { id: userId },
        role: ChannelRole.ADMIN,
      });
      await this.userChannelRepo.save(userChannel);
      return savedWorkspace;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new BadRequestException((error as { message: string }).message);
      }

      throw new BadRequestException('Failed to create workspace');
    }
  }

  findAll() {
    return `This action returns all workspace`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workspace`;
  }

  update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    return `This action updates a #${id} workspace`;
  }

  remove(id: number) {
    return `This action removes a #${id} workspace`;
  }
}
