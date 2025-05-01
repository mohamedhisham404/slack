import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChannelsDto } from './dto/create-channel.dto';
import { UpdateChannelsDto } from './dto/update-channel.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channels } from './entities/channel.entity';
import { ChannelRole, UserChannel } from './entities/user-channel.entity';
import { AddUserDto } from './dto/add-user.dto';
import { User } from 'src/user/entities/user.entity';
import { handleError } from 'src/utils/errorHandling';
import { UserWorkspace } from 'src/workspace/entities/user-workspace.entity';
import { WorkspaceService } from 'src/workspace/workspace.service';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channels)
    private readonly channelRepo: Repository<Channels>,

    @InjectRepository(UserChannel)
    private readonly userChannelRepo: Repository<UserChannel>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepo: Repository<UserWorkspace>,

    private readonly workspaceService: WorkspaceService,
  ) {}

  async checkTheChannel(channel_id: number, user_id: number) {
    const channel = await this.channelRepo.findOne({
      where: {
        id: channel_id,
      },
    });
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const userChannel = await this.userChannelRepo.findOne({
      where: {
        channel: { id: channel_id },
        user: { id: user_id },
      },
    });

    if (!userChannel) {
      throw new BadRequestException(
        'You must be a member of the channel to do action on the channel',
      );
    }
  }

  async create(
    createChannelDto: CreateChannelsDto,
    req: Request,
    flag: boolean = false,
  ) {
    try {
      const userId = req.user.userId;
      const {
        workspace_id,
        name,
        topic,
        description,
        is_private,
        is_dm,
        admin_only,
      } = createChannelDto;

      if (workspace_id === 1 && flag == false) {
        throw new NotFoundException(
          'you are not allowed to access this workspace',
        );
      }

      await this.workspaceService.checkWorkspace(workspace_id, userId);

      const existingChannel = await this.channelRepo.findOne({
        where: {
          workspace: { id: workspace_id },
          name: name,
        },
        relations: {
          workspace: true,
        },
      });

      if (existingChannel) {
        throw new BadRequestException(
          'A channel with this name already exists in the workspace',
        );
      }

      const channel = this.channelRepo.create({
        workspace: { id: workspace_id },
        name,
        created_by: userId,
        topic,
        description,
        is_private,
        is_dm,
        admin_only,
      });

      const savedChannel = await this.channelRepo.save(channel);

      const userChannel = this.userChannelRepo.create({
        channel: channel,
        user: { id: userId },
        role: ChannelRole.ADMIN,
      });
      await this.userChannelRepo.save(userChannel);

      if (is_private === false || is_private === undefined) {
        const workspaceUsers = await this.userWorkspaceRepo.find({
          where: { workspace: { id: workspace_id } },
          relations: ['user'],
        });

        const userChannels = workspaceUsers
          .filter((uw) => uw.user.id !== userId)
          .map((uw) =>
            this.userChannelRepo.create({
              channel: { id: savedChannel.id },
              user: { id: uw.user.id },
              role: ChannelRole.MEMBER,
            }),
          );

        if (userChannels.length > 0) {
          await this.userChannelRepo.save(userChannels);
        }
      }

      return savedChannel;
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async addUser(addUser: AddUserDto, req: Request) {
    try {
      const { channel_id, user_id, role } = addUser;
      const currentUserId = req.user.userId;

      await this.checkTheChannel(channel_id, currentUserId);

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

      const existingUserChannel = await this.userChannelRepo.findOne({
        where: {
          user: { id: user_id },
          channel: { id: channel_id },
        },
      });
      if (existingUserChannel) {
        throw new BadRequestException(
          'User is already a member of this channel',
        );
      }

      const channel = await this.channelRepo.findOne({
        where: { id: channel_id },
      });
      const currentUserChannel = await this.userChannelRepo.findOne({
        where: {
          user: { id: currentUserId },
          channel: { id: channel_id },
        },
      });
      if (
        channel?.is_private &&
        currentUserChannel?.role !== ChannelRole.ADMIN
      ) {
        throw new BadRequestException(
          'You are not allowed to add users to this channel',
        );
      }

      const userChannel = this.userChannelRepo.create({
        channel: { id: channel_id },
        user: { id: user_id },
        role: role || ChannelRole.MEMBER,
      });
      await this.userChannelRepo.save(userChannel);
      return {
        message: 'User added to channel successfully',
        channel: { id: channel_id },
        user: addedUser,
      };
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async findAllByWorkspace(workspace_id: number, req: Request) {
    try {
      const user_id = req.user.userId;

      if (workspace_id === 1) {
        throw new NotFoundException(
          'you are not allowed to access this workspace',
        );
      }

      await this.workspaceService.checkWorkspace(workspace_id, user_id);

      const channels = await this.channelRepo.find({
        where: {
          workspace: { id: workspace_id },
        },
        relations: {
          userChannels: {
            user: true,
          },
          workspace: true,
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
          workspace: { id: true, name: true },
        },
      });
      if (!channels || channels.length === 0) {
        throw new NotFoundException('Channels not found');
      }

      return channels;
    } catch (error) {
      handleError(error);
    }
  }

  async findOneByWorkspace(
    channel_id: number,
    workspace_id: number,
    req: Request,
  ) {
    try {
      const user_id = req.user.userId;

      if (workspace_id === 1) {
        throw new NotFoundException('Workspace not found');
      }
      await this.workspaceService.checkWorkspace(workspace_id, user_id);

      const channel = await this.channelRepo.findOne({
        where: {
          id: channel_id,
          workspace: { id: workspace_id },
        },
        relations: {
          workspace: true,
        },
        select: {
          id: true,
          topic: true,
          description: true,
          is_private: true,
          is_dm: true,
          admin_only: true,
          created_by: true,
          workspace: { id: true, name: true },
        },
      });
      if (!channel) {
        throw new NotFoundException('Channel not found');
      }
      return channel;
    } catch (error) {
      handleError(error);
    }
  }

  async findAllDM(req: Request) {
    try {
      const user_id = req.user.userId;
      const workspace_id = 1;

      const userChannels = await this.userChannelRepo.find({
        where: {
          user: { id: user_id },
          channel: { workspace: { id: workspace_id }, is_dm: true },
        },
        relations: {
          channel: {
            userChannels: {
              user: true,
            },
          },
        },
      });

      const results = userChannels.map((userChannel) => {
        const participants = userChannel.channel.userChannels;
        const otherUser = participants.find(
          (participant) => participant.user.id !== user_id,
        );

        return {
          channelId: userChannel.channel.id,
          name: otherUser?.user.name,
        };
      });

      return results;
    } catch (error) {
      handleError(error);
    }
  }

  async findOneDM(id: number, req: Request) {
    try {
      const user_id = req.user.userId;

      const userChannel = await this.userChannelRepo.find({
        where: {
          channel: { id: id, is_dm: true },
        },
        relations: {
          user: true,
          channel: true,
        },
      });

      const otherParticipant = userChannel.find(
        (participant) => participant.user.id !== user_id,
      );

      if (!otherParticipant) {
        throw new NotFoundException('Other participant not found');
      }

      return {
        channelId: userChannel[0].channel.id,
        createdAt: userChannel[0].channel['created_at'],
        createdBy: userChannel[0].channel['created_by'],
        name: otherParticipant.user.name,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async update(id: number, updateChannelDto: UpdateChannelsDto, req: Request) {
    try {
      const userId = req.user.userId;
      const { name, topic, description, is_private, is_dm, admin_only } =
        updateChannelDto;

      const userChannel = await this.userChannelRepo.findOne({
        where: {
          channel: { id: id },
          user: { id: userId },
        },
      });
      if (userChannel?.role !== ChannelRole.ADMIN) {
        throw new BadRequestException(
          'You are not allowed to update this channel',
        );
      }

      const channel = await this.channelRepo.findOne({
        where: {
          id: id,
        },
        relations: {
          workspace: true,
        },
      });
      if (!channel) {
        throw new NotFoundException('Channel not found');
      }

      const existingChannel = await this.channelRepo.findOne({
        where: {
          workspace: { id: channel.workspace.id },
          name: name,
        },
      });
      if (existingChannel && existingChannel.id !== id) {
        throw new BadRequestException(
          'A channel with this name already exists in the workspace',
        );
      }

      if (name !== undefined) channel.name = name;
      if (topic !== undefined) channel.topic = topic;
      if (description !== undefined) channel.description = description;
      if (is_private !== undefined) channel.is_private = is_private;
      if (is_dm !== undefined) channel.is_dm = is_dm;
      if (admin_only !== undefined) channel.admin_only = admin_only;

      return channel;
    } catch (error) {
      handleError(error);
    }
  }

  async removeUser(channel_id: number, user_id: number, req: Request) {
    try {
      const currentUserId = req.user.userId;
      await this.checkTheChannel(channel_id, currentUserId);

      if (currentUserId === user_id) {
        throw new BadRequestException(
          'You cannot remove yourself from the channel',
        );
      }

      const currentUserChannel = await this.userChannelRepo.findOne({
        where: {
          user: { id: currentUserId },
          channel: { id: channel_id },
        },
      });
      if (currentUserChannel?.role !== ChannelRole.ADMIN) {
        throw new BadRequestException(
          'You are not allowed to remove users from this channel',
        );
      }

      const userChannel = await this.userChannelRepo.findOne({
        where: {
          user: { id: user_id },
          channel: { id: channel_id },
        },
      });
      if (!userChannel) {
        throw new NotFoundException('User not found in this channel');
      }
      if (userChannel.role === ChannelRole.ADMIN) {
        throw new BadRequestException(
          'You cannot remove an admin from this channel',
        );
      }
      const deletedUserChannel = await this.userChannelRepo.remove(userChannel);
      if (!deletedUserChannel) {
        throw new NotFoundException('User not found in this channel');
      }
      return {
        message: 'User removed from channel successfully',
        userId: user_id,
        channelId: channel_id,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async remove(id: number, req: Request) {
    const userId = req.user.userId;

    const userChannel = await this.userChannelRepo.findOne({
      where: {
        channel: { id: id },
        user: { id: userId },
      },
    });
    if (userChannel?.role !== ChannelRole.ADMIN) {
      throw new BadRequestException(
        'You are not allowed to update this channel',
      );
    }

    const channel = await this.channelRepo.findOne({
      where: {
        id: id,
      },
    });
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    const userChannels = await this.userChannelRepo.find({
      where: {
        channel: { id: id },
      },
    });
    if (userChannels.length > 0) {
      await this.userChannelRepo.remove(userChannels);
    }
    const deletedChannel = await this.channelRepo.remove(channel);
    if (!deletedChannel) {
      throw new NotFoundException('Channel not found');
    }
    return {
      message: 'Channel deleted successfully',
      channel: deletedChannel,
    };
  }
}
