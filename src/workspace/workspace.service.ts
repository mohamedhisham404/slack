import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { In, Repository } from 'typeorm';
import { UserWorkspace, workspaceRole } from './entities/user-workspace.entity';
import { Request } from 'express';
import { Channels } from 'src/channels/entities/channel.entity';
import {
  ChannelRole,
  UserChannel,
} from 'src/channels/entities/user-channel.entity';
import { AddUserDto } from './dto/add-user.dto';
import { User } from 'src/user/entities/user.entity';
import { handleError } from 'src/utils/errorHandling';

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

  async checkWorkspace(workspace_id: number, user_id: number) {
    const workspace = await this.workSpaceRepo.findOne({
      where: {
        id: workspace_id,
      },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const userWorkspace = await this.userWorkspaceRepo.findOne({
      where: {
        workspace: { id: workspace_id },
        user: { id: user_id },
      },
    });

    if (!userWorkspace) {
      throw new BadRequestException(
        'You must be a member of the workspace to do action to a channel',
      );
    }
  }

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
      handleError(error);
    }
  }

  async addUser(addUser: AddUserDto, req: Request) {
    try {
      const { workspace_id, user_id, role } = addUser;
      const currentUserId = req.user.userId;

      await this.checkWorkspace(workspace_id, currentUserId);

      const addedUser = await this.userRepo.findOne({
        where: { id: user_id },
      });
      if (!addedUser) {
        throw new BadRequestException('User does not exist');
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
        role: role as workspaceRole,
      });
      await this.userWorkspaceRepo.save(userWorkspace);

      const channels = await this.channelRepo.find({
        where: {
          workspace: { id: workspace_id },
          is_private: false,
        },
      });

      const userChannels = channels.map((channel) => {
        return this.userChannelRepo.create({
          channel: { id: channel.id },
          user: { id: user_id },
          role: ChannelRole.MEMBER,
        });
      });

      await this.userChannelRepo.save(userChannels);

      return {
        message: 'User added to workspace successfully',
        user: addedUser,
      };
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async findOne(id: number) {
    return await this.workSpaceRepo.findOne({
      where: { id },
      relations: {
        channels: true,
      },
    });
  }

  async update(
    id: number,
    updateWorkspaceDto: UpdateWorkspaceDto,
    req: Request,
  ) {
    const userId = req.user.userId;
    const workspaceUser = await this.userWorkspaceRepo.findOne({
      where: {
        user: { id: userId },
        workspace: { id },
      },
    });
    if (!workspaceUser) {
      throw new BadRequestException('You are not a member of this workspace');
    }
    if (workspaceUser.role !== workspaceRole.ADMIN) {
      throw new BadRequestException('You are not an admin of this workspace');
    }
    return this.workSpaceRepo.update(id, updateWorkspaceDto);
  }

  async remove(id: number, req: Request) {
    const userId = req.user.userId;
    const workspaceUser = await this.userWorkspaceRepo.findOne({
      where: {
        user: { id: userId },
        workspace: { id },
      },
    });
    if (!workspaceUser) {
      throw new BadRequestException('You are not a member of this workspace');
    }
    if (workspaceUser.role !== workspaceRole.ADMIN) {
      throw new BadRequestException('You are not an admin of this workspace');
    }
    const channels = await this.channelRepo.find({
      where: {
        workspace: { id },
      },
    });
    const channelIds = channels.map((channel) => channel.id);
    await this.userChannelRepo.delete({
      channel: { id: In(channelIds) },
      user: { id: userId },
    });
    await this.userWorkspaceRepo.delete({
      workspace: { id },
      user: { id: userId },
    });
    const result = await this.workSpaceRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Workspace not found');
    }
    return {
      message: 'Workspace deleted successfully',
      workspaceId: id,
    };
  }
}
