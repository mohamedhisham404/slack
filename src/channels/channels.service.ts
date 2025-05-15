import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChannelsDto } from './dto/create-channel.dto';
import { UpdateChannelsDto } from './dto/update-channel.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Channels } from './entities/channel.entity';
import { UserChannel } from './entities/user-channel.entity';
import { AddUserDto } from './dto/add-user.dto';
import { handleError } from 'src/utils/errorHandling';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { ChannelRole } from './enums/channel-role.enum';
import { getUserFromRequest } from 'src/utils/get-user';
import { workspaceRole } from 'src/workspace/enums/workspace-role.enum';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { Attachment } from 'src/attachment/entities/attachment.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channels)
    private readonly channelRepo: Repository<Channels>,

    @InjectRepository(UserChannel)
    private readonly userChannelRepo: Repository<UserChannel>,

    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,

    @InjectRepository(Attachment)
    private readonly attachmentRepo: Repository<Attachment>,

    private minioClientService: MinioClientService,

    private readonly workspaceService: WorkspaceService,

    private readonly dataSource: DataSource,
  ) {}

  async checkTheChannel(channelId: string, userId: string) {
    const channel = await this.channelRepo.findOne({
      where: {
        id: channelId,
      },
      relations: {
        userChannels: {
          user: true,
        },
      },
      select: {
        id: true,
        name: true,
        topic: true,
        description: true,
        is_private: true,
        is_dm: true,
        is_general: true,
        admin_only: true,
        created_by: true,
        userChannels: {
          id: true,
          role: true,
          user: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const userChannel = channel.userChannels?.find(
      (uc) => uc.user.id === userId,
    );

    if (!userChannel) {
      throw new NotFoundException('user not a member of this channel');
    }

    return {
      id: channel.id,
      name: channel.name,
      topic: channel.topic,
      description: channel.description,
      is_private: channel.is_private,
      is_dm: channel.is_dm,
      is_general: channel.is_general,
      admin_only: channel.admin_only,
      created_by: channel.created_by,
      userChannel: {
        id: userChannel.id,
        role: userChannel.role,
        user: {
          id: userChannel.user.id,
          email: userChannel.user.email,
          name: userChannel.user.name,
        },
      },
    };
  }

  async create(createChannelDto: CreateChannelsDto, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      const workspace = await this.workspaceRepo.findOne({
        where: {
          id: createChannelDto.workspaceId,
        },
        relations: {
          userWorkspaces: {
            user: true,
          },
          channels: true,
        },
        select: {
          userWorkspaces: {
            user: { id: true },
            role: true,
          },
          channels: {
            name: true,
          },
        },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const existingUser = workspace.userWorkspaces.find(
        (user) => user.user.id === userId,
      );
      if (!existingUser) {
        throw new NotFoundException('You are not a member of this workspace');
      }

      if (existingUser.role !== workspaceRole.ADMIN) {
        throw new BadRequestException(
          'You are not allowed to create a channel in this workspace',
        );
      }

      const existingChannel = workspace.channels.find(
        (channel) => channel.name === createChannelDto.name,
      );
      if (existingChannel) {
        throw new BadRequestException('Channel name already exists');
      }

      const channel = await this.dataSource.transaction(async (manager) => {
        const channel = manager.create(Channels, {
          ...createChannelDto,
          created_by: { id: userId },
          workspace: { id: createChannelDto.workspaceId },
          userChannels: [
            {
              user: { id: userId },
              role: ChannelRole.ADMIN,
            },
          ],
        });

        const savedChannel = await manager.save(channel);
        return savedChannel;
      });

      return {
        message: 'Channel created successfully',
        channel: {
          id: channel.id,
          name: channel.name,
          topic: channel.topic,
          description: channel.description,
          is_private: channel.is_private,
          is_dm: channel.is_dm,
          admin_only: channel.admin_only,
          created_by: channel.created_by,
        },
      };
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async addUser(addUser: AddUserDto, req: Request, isDmFromMessage = false) {
    try {
      const { channelId, userId, role } = addUser;

      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      if (!channelId || !currentUserId) {
        throw new BadRequestException('Channel ID and User ID are required');
      }

      const currentChannel = await this.channelRepo.findOne({
        where: [
          { id: channelId, userChannels: { user: { id: currentUserId } } },
          { id: channelId, userChannels: { user: { id: userId } } },
        ],
        relations: {
          userChannels: { user: true },
          workspace: { userWorkspaces: { user: true } },
        },
        select: {
          id: true,
          is_private: true,
          workspace: {
            id: true,
            userWorkspaces: {
              id: true,
              user: { id: true },
            },
          },
          userChannels: {
            id: true,
            role: true,
            user: { id: true },
          },
        },
      });

      if (!currentChannel) {
        throw new NotFoundException('Channel not found');
      }

      if (
        currentUserId === userId &&
        !isDmFromMessage &&
        currentChannel.is_private
      ) {
        throw new BadRequestException('You cannot add yourself to the channel');
      }

      const userChannel = currentChannel.userChannels.find(
        (uc) => uc.user.id === currentUserId,
      );
      if (!userChannel) {
        throw new NotFoundException('You are not a member of this channel');
      }

      if (
        role === ChannelRole.ADMIN &&
        userChannel.role !== ChannelRole.ADMIN
      ) {
        throw new BadRequestException(
          'You are not allowed to add someone as admin',
        );
      }

      if (currentChannel?.is_private && role === ChannelRole.MEMBER) {
        throw new BadRequestException(
          'You are not allowed to add someone as member to a private channel',
        );
      }

      const addedUserWorkspace = currentChannel.workspace.userWorkspaces.find(
        (uw) => uw.user.id === userId,
      );
      if (!addedUserWorkspace) {
        throw new NotFoundException('User not found in this workspace');
      }

      const addedUserChannel = currentChannel.userChannels.find(
        (uc) => uc.user.id === userId,
      );
      if (addedUserChannel) {
        throw new BadRequestException('User already exists in this channel');
      }

      await this.userChannelRepo.insert({
        user: { id: userId },
        channel: { id: channelId },
        role: role,
      });

      return {
        message: 'User added to channel successfully',
        userId: userId,
        channelId: channelId,
      };
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async findAllParticipatingChannelsInWorkspace(
    workspaceId: string,
    req: Request,
  ) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      const userChannels = await this.userChannelRepo.find({
        where: {
          user: { id: currentUserId },
          channel: {
            workspace: { id: workspaceId },
          },
        },
        relations: {
          channel: true,
          user: true,
        },
      });

      if (!userChannels || userChannels.length === 0) {
        throw new NotFoundException('You are not a member of this workspace');
      }

      const formatted = userChannels.map((uc) => {
        const { channel, role } = uc;
        return {
          id: channel.id,
          name: channel.name,
          topic: channel.topic,
          description: channel.description,
          is_private: channel.is_private,
          is_dm: channel.is_dm,
          admin_only: channel.admin_only,
          created_by: channel.created_by,
          role,
        };
      });

      return formatted;
    } catch (error) {
      handleError(error);
    }
  }

  async findAllByWorkspace(workspaceId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      const channels = await this.channelRepo.find({
        where: {
          workspace: {
            id: workspaceId,
            userWorkspaces: { user: { id: currentUserId } },
          },
        },
        relations: {
          userChannels: {
            user: true,
          },
          workspace: {
            userWorkspaces: {
              user: true,
            },
          },
        },
        select: {
          id: true,
          name: true,
          topic: true,
          description: true,
          is_private: true,
          is_dm: true,
          admin_only: true,
          created_by: true,
          userChannels: {
            role: true,
            user: { id: true, name: true },
          },
          workspace: {
            id: true,
            userWorkspaces: {
              user: { id: true, name: true },
              role: true,
            },
          },
        },
      });

      const workspace = channels[0]?.workspace;

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const userInWorkspace = workspace.userWorkspaces.some(
        (uw) => uw.user.id === currentUserId,
      );

      if (!userInWorkspace) {
        throw new BadRequestException('User is not a member of this workspace');
      }

      if (!channels || channels.length === 0) {
        throw new NotFoundException('this workspace has no channels');
      }

      return {
        workspace,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        channels: channels.map(({ workspace, ...channel }) => channel),
      };
    } catch (error) {
      handleError(error);
    }
  }

  async findOne(channelId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      if (!currentUserId) {
        throw new BadRequestException('Workspace ID is required');
      }

      const channel = await this.channelRepo.findOne({
        where: { id: channelId },
        relations: {
          workspace: {
            userWorkspaces: {
              user: true,
            },
          },
        },
        select: {
          workspace: {
            id: true,
            userWorkspaces: {
              user: { id: true },
            },
          },
        },
      });

      if (!channel?.workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const userInWorkspace = channel.workspace.userWorkspaces.some(
        (uw) => uw.user.id === currentUserId,
      );

      if (!userInWorkspace) {
        throw new BadRequestException('User is not a member of this workspace');
      }

      const channelChecked = await this.checkTheChannel(
        channelId,
        currentUserId,
      );

      return channelChecked;
    } catch (error) {
      handleError(error);
    }
  }

  async findAllDM(workspaceId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      if (!workspaceId || !currentUserId) {
        throw new BadRequestException('Workspace ID is required');
      }
      await this.workspaceService.checkWorkspace(workspaceId, currentUserId);

      const userChannels = await this.userChannelRepo.find({
        where: {
          user: { id: currentUserId },
          channel: { workspace: { id: workspaceId }, is_dm: true },
        },
        relations: {
          channel: {
            userChannels: {
              user: true,
            },
          },
        },
        select: {
          id: true,
          channel: {
            id: true,
            name: true,
            topic: true,
            description: true,
            is_private: true,
            is_dm: true,
            admin_only: true,
            created_by: true,
            userChannels: {
              role: true,
              user: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      });

      if (!userChannels || userChannels.length === 0) {
        throw new NotFoundException('You have no DM channels');
      }

      return userChannels;
    } catch (error) {
      handleError(error);
    }
  }

  async findOneDM(DMId: string, workspaceId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      if (!workspaceId || !currentUserId) {
        throw new BadRequestException('Workspace ID is required');
      }
      await this.workspaceService.checkWorkspace(workspaceId, currentUserId);

      const userChannel = await this.userChannelRepo.find({
        where: {
          channel: { id: DMId, workspace: { id: workspaceId }, is_dm: true },
          user: { id: currentUserId },
        },
        relations: {
          user: true,
          channel: true,
        },
        select: {
          id: true,
          user: {
            id: true,
            name: true,
            email: true,
          },
          channel: {
            id: true,
            name: true,
            topic: true,
            description: true,
            is_private: true,
            is_dm: true,
            admin_only: true,
            created_by: true,
          },
        },
      });

      if (!userChannel || userChannel.length === 0) {
        throw new NotFoundException('You are not a member of this DM channel');
      }

      return userChannel;
    } catch (error) {
      handleError(error);
    }
  }

  async update(
    channelId: string,
    updateChannelDto: UpdateChannelsDto,
    req: Request,
  ) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      if (!userId) {
        throw new BadRequestException('Workspace ID and User ID are required');
      }

      const channel = await this.checkTheChannel(channelId, userId);

      if (channel.userChannel.role !== ChannelRole.ADMIN) {
        throw new BadRequestException(
          'You are not allowed to update this channel',
        );
      }

      if (channel.is_general && updateChannelDto.is_general) {
        throw new BadRequestException('You cannot update the general channel');
      }

      const result = await this.channelRepo
        .createQueryBuilder()
        .update(Channels)
        .set({
          ...updateChannelDto,
        })
        .where('id = :id', { id: channelId })
        .returning('*')
        .execute();

      const updatedChannel = (result.raw as Channels[])[0];

      return updatedChannel;
    } catch (error) {
      handleError(error);
    }
  }

  async removeUser(channelId: string, userId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      if (userId === currentUserId) {
        throw new BadRequestException(
          'You cannot remove yourself from the channel',
        );
      }

      if (!channelId || !currentUserId) {
        throw new BadRequestException('Workspace ID and User ID are required');
      }

      const channel = await this.checkTheChannel(channelId, currentUserId);

      if (channel.is_dm) {
        throw new BadRequestException(
          'You cannot remove a user from a DM channel',
        );
      }

      if (channel.userChannel.role !== ChannelRole.ADMIN) {
        throw new BadRequestException(
          'You are not allowed to remove a user from this channel',
        );
      }

      const result = await this.userChannelRepo.delete({
        user: { id: userId },
        channel: { id: channelId },
      });

      if (result.affected === 0) {
        throw new NotFoundException('User not found in this channel');
      }

      return {
        message: 'User removed from channel successfully',
        userId: userId,
        channelId: channelId,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async remove(channelId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      if (!channelId || !currentUserId) {
        throw new BadRequestException('Workspace ID and User ID are required');
      }

      const channel = await this.checkTheChannel(channelId, currentUserId);

      if (channel.userChannel.role !== ChannelRole.ADMIN) {
        throw new BadRequestException(
          'You are not allowed to remove this channel',
        );
      }

      if (channel.is_general) {
        throw new BadRequestException(
          'You cannot remove a user from the general channel',
        );
      }

      const attachments = await this.attachmentRepo
        .createQueryBuilder('attachment')
        .leftJoin('attachment.message', 'message')
        .leftJoin('message.channel', 'channel')
        .where('channel.id = :channelId', { channelId })
        .select(['attachment.url', 'attachment.type'])
        .getMany();

      for (const attachment of attachments) {
        const objectName = attachment.url.split('/').pop();
        if (!objectName) {
          throw new NotFoundException('Object name not found in URL');
        }
        await this.minioClientService.delete(objectName, attachment.type);
      }

      const result = await this.channelRepo.delete({
        id: channelId,
      });

      if (result.affected === 0) {
        throw new NotFoundException('Channel not found');
      }

      return {
        message: 'Channel removed successfully',
        channelId: channelId,
      };
    } catch (error) {
      handleError(error);
    }
  }
}
