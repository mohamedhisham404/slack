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
import { AddUserDto } from './dto/add-user.dto';
import { User } from 'src/user/entities/user.entity';

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

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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

  async addUser(addUser: AddUserDto, req: Request) {
    try {
      const { workspace_id, user_id, role } = addUser;
      const currentUserId = req.user.userId;

      const workspace = await this.workSpaceRepo.findOne({
        where: { id: workspace_id },
      });
      if (!workspace) {
        throw new BadRequestException('Workspace does not exist');
      }

      const addedUser = await this.userRepo.findOne({
        where: { id: user_id },
      });
      if (!addedUser) {
        throw new BadRequestException('User does not exist');
      }

      const currentUserWorkspace = await this.userWorkspaceRepo.find({
        where: {
          user: { id: currentUserId },
          workspace: { id: workspace_id },
        },
        relations: ['user', 'workspace'],
      });
      if (currentUserWorkspace.length === 0) {
        throw new BadRequestException('You are not a member of this workspace');
      }

      const existingUserworkspace = await this.userWorkspaceRepo.findOne({
        where: {
          user: { id: user_id },
          workspace: { id: workspace_id },
        },
      });
      if (existingUserworkspace) {
        throw new BadRequestException(
          'User is already a member of this workspace',
        );
      }

      const userWorkspace = this.userWorkspaceRepo.create({
        workspace: { id: workspace_id },
        user: { id: user_id },
        role: role,
      });
      await this.userWorkspaceRepo.save(userWorkspace);

      const channel = await this.channelRepo.findOne({
        where: { workspace: { id: workspace_id }, name: 'general' },
      });
      const userChannel = this.userChannelRepo.create({
        channel: { id: channel?.id },
        user: { id: user_id },
        role: ChannelRole.MEMBER,
      });
      await this.userChannelRepo.save(userChannel);

      return {
        message: 'User added to workspace successfully',
        workspace,
        user: addedUser,
      };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new BadRequestException((error as { message: string }).message);
      }

      throw new BadRequestException('Failed to add user to workspace');
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
