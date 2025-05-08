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
import { UserWorkspace } from './entities/user-workspace.entity';
import { Request } from 'express';
import { Channels } from 'src/channels/entities/channel.entity';
import { UserChannel } from 'src/channels/entities/user-channel.entity';
import { AddUserDto } from './dto/add-user.dto';
import { User } from 'src/user/entities/user.entity';
import { handleError } from 'src/utils/errorHandling';
import { NotificationWorkspace } from 'src/notification-workspace/entities/notification-workspace.entity';
import { ChannelRole } from 'src/channels/enums/channel-role.enum';
import { workspaceRole } from './enums/workspace-role.enum';

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

    @InjectRepository(NotificationWorkspace)
    private readonly notificationWorkspaceRepo: Repository<NotificationWorkspace>,
  ) {}

  async checkWorkspace(workspace_id: number, user_id: number) {
    const workspace = await this.workSpaceRepo.findOne({
      where: {
        id: workspace_id,
        userWorkspaces: { id: user_id },
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

      await this.notificationWorkspaceRepo.save({
        user_id: userId,
        workspace_id: savedWorkspace.id,
        admin_notifications: true,
        huddle_notifications: true,
      });

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

      if (workspace_id === 1) {
        throw new BadRequestException(
          'You cannot do this action to this workspace',
        );
      }

      await this.checkWorkspace(workspace_id, currentUserId);

      const addedUser = await this.userRepo.findOne({
        where: { id: user_id },
        select: {
          id: true,
          name: true,
        },
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

      await this.notificationWorkspaceRepo.save({
        user_id: user_id,
        workspace_id: workspace_id,
        admin_notifications: true,
        huddle_notifications: true,
      });

      return {
        message: 'User added to workspace successfully',
        user: addedUser,
      };
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async findOne(id: number, req: Request) {
    const userId = req.user.userId;

    await this.checkWorkspace(id, userId);
    if (id === 1) {
      throw new BadRequestException(
        'You cannot do this action to this workspace',
      );
    }
    return await this.workSpaceRepo.findOne({
      where: { id },
      relations: {
        channels: true,
      },
    });
  }

  async getAll(req: Request) {
    const userId = req.user.userId;

    const Workspaces = await this.userWorkspaceRepo.find({
      where: {
        user: { id: userId },
      },
      relations: {
        workspace: {
          channels: true,
        },
      },
    });

    return Workspaces;
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
    await this.checkWorkspace(id, userId);

    if (id == 1) {
      throw new BadRequestException(
        'You cannot do this action to this workspace',
      );
    }

    if (workspaceUser?.role !== workspaceRole.ADMIN) {
      throw new BadRequestException('You are not an admin of this workspace');
    }
    await this.workSpaceRepo.update(id, updateWorkspaceDto);

    return {
      message: 'Workspace updated successfully',
      workspaceId: id,
      workspaceName: updateWorkspaceDto.name,
    };
  }

  async removeUser(workspace_id: number, user_id: number, req: Request) {
    try {
      const currentUserId = req.user.userId;
      await this.checkWorkspace(workspace_id, currentUserId);

      if (workspace_id == 1) {
        throw new BadRequestException(
          'You cannot do this action to this workspace',
        );
      }

      if (user_id === currentUserId) {
        throw new BadRequestException(
          'You cannot remove yourself from the workspace',
        );
      }

      const currentUserworkspace = await this.userWorkspaceRepo.findOne({
        where: {
          user: { id: currentUserId },
          workspace: { id: workspace_id },
        },
      });
      if (currentUserworkspace?.role !== workspaceRole.ADMIN) {
        throw new BadRequestException('You are not an admin of this workspace');
      }

      const userWorkspace = await this.userWorkspaceRepo.findOne({
        where: {
          user: { id: user_id },
          workspace: { id: workspace_id },
        },
      });
      if (!userWorkspace) {
        throw new NotFoundException('User not found in this workspace');
      }
      if (userWorkspace.role === workspaceRole.ADMIN) {
        throw new BadRequestException(
          'You cannot remove a user who is an admin of this workspace',
        );
      }

      const channels = await this.channelRepo.find({
        where: {
          workspace: { id: workspace_id },
        },
      });
      const channelIds = channels.map((channel) => channel.id);

      await this.userChannelRepo.delete({
        channel: { id: In(channelIds) },
        user: { id: user_id },
      });

      await this.userWorkspaceRepo.delete({
        workspace: { id: workspace_id },
        user: { id: user_id },
      });

      await this.notificationWorkspaceRepo.delete({
        workspace: { id: workspace_id },
        user: { id: user_id },
      });

      return {
        message: 'User removed from workspace successfully',
        userId: user_id,
        workspaceId: workspace_id,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async remove(id: number, req: Request) {
    const userId = req.user.userId;
    const workspaceUser = await this.userWorkspaceRepo.findOne({
      where: {
        user: { id: userId },
        workspace: { id },
      },
    });
    await this.checkWorkspace(id, userId);

    if (id == 1) {
      throw new BadRequestException(
        'You cannot do this action to this workspace',
      );
    }

    if (workspaceUser?.role !== workspaceRole.ADMIN) {
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

    await this.notificationWorkspaceRepo.delete({
      workspace_id: id,
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
