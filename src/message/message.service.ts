import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { DataSource, Repository } from 'typeorm';
import { Channels } from 'src/channels/entities/channel.entity';
import { ChannelsService } from 'src/channels/channels.service';
// import { EventsGateway } from 'src/events/events.gateway';
import { User } from 'src/user/entities/user.entity';
import { UpdateMessageDto } from './dto/update-message.dto';
import { handleError } from 'src/utils/errorHandling';
// import { CustomSocket } from 'src/events/types/socket.interface';
import { ChannelRole } from 'src/channels/enums/channel-role.enum';
import { getUserFromRequest } from 'src/utils/get-user';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,

    @InjectRepository(Channels)
    private readonly channelsRepo: Repository<Channels>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly channelsService: ChannelsService,

    // private readonly eventsGateway: EventsGateway,

    private readonly dataSource: DataSource,
  ) {}

  async createMessageTransaction(
    CreateChannelMessageDto: CreateMessageDto,
    currentUserId: string,
  ) {
    const { content, channelId, parentMessageId, isPinned } =
      CreateChannelMessageDto;

    const savedMessage = await this.dataSource.transaction(async (manager) => {
      const newMessage = manager.create(Message, {
        content: content,
        is_pinned: isPinned ?? false,
        user: { id: currentUserId },
        channel: { id: channelId },
        ...(parentMessageId && {
          parent_message: { id: parentMessageId },
        }),
      });

      const savedMessage = await manager.save(newMessage);

      if (parentMessageId) {
        await manager.update(
          Message,
          { id: parentMessageId },
          { reply_count: () => 'reply_count + 1' },
        );
      }

      return savedMessage;
    });

    if (!savedMessage) {
      throw new NotFoundException('Message not sent');
    }
    return savedMessage;
  }

  async createMessage(CreateChannelMessageDto: CreateMessageDto, req: Request) {
    try {
      const { userId, workspaceId } = CreateChannelMessageDto;
      const messageDto = { ...CreateChannelMessageDto };

      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      if (!currentUserId) {
        throw new NotFoundException('User not found');
      }

      if (messageDto.channelId) {
        const channel = await this.channelsRepo.findOne({
          where: {
            id: messageDto.channelId,
            userChannels: { user: { id: currentUserId } },
          },
          relations: {
            userChannels: {
              user: true,
            },
          },
          select: {
            id: true,
            admin_only: true,
            userChannels: {
              id: true,
              role: true,
              user: {
                id: true,
              },
            },
          },
        });

        if (!channel) {
          throw new NotFoundException('Channel not found');
        }

        if (!channel.userChannels || channel.userChannels.length === 0) {
          throw new NotFoundException('You are not a member of this channel');
        }

        const userChannel = channel.userChannels.find(
          (uc) => uc.user.id === currentUserId,
        );
        if (
          !userChannel ||
          (userChannel.role !== ChannelRole.ADMIN && channel.admin_only)
        ) {
          throw new BadRequestException(
            'Only admins can send messages in this channel',
          );
        }

        const message = await this.createMessageTransaction(
          CreateChannelMessageDto,
          currentUserId,
        );

        return message;
      } else if (userId) {
        const users = await this.userRepo
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.userWorkspaces', 'userWorkspace')
          .leftJoinAndSelect('userWorkspace.workspace', 'workspace')
          .leftJoinAndSelect('user.userChannels', 'userChannel')
          .leftJoinAndSelect('userChannel.channel', 'channel')
          .where('user.id IN (:...userIds)', {
            userIds: [currentUserId, userId],
          })
          .andWhere('workspace.id = :workspaceId', { workspaceId })
          .andWhere('channel.workspace.id = :workspaceId', { workspaceId })
          .select([
            'user.id',
            'userWorkspace.id',
            'workspace.id',
            'userChannel.id',
            'channel.id',
            'channel.name',
          ])
          .getMany();

        const currentUser = users.find((u) => u.id === currentUserId);
        if (!currentUser) {
          throw new ForbiddenException('You are not in this workspace');
        }

        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) {
          const userExists = await this.userRepo.findOne({
            where: { id: userId },
            select: { id: true },
          });

          if (!userExists) {
            throw new NotFoundException('User does not exist');
          }

          throw new BadRequestException('User is not in this workspace');
        }

        const channelName1 = `DM_${currentUserId}_${userId}`;
        const channelName2 = `DM_${userId}_${currentUserId}`;

        const DMChannel = targetUser.userChannels.find(
          (uc) =>
            uc.channel.is_dm &&
            (uc.channel.name === channelName1 ||
              uc.channel.name === channelName2),
        )?.channel;

        if (!DMChannel) {
          if (!workspaceId) {
            throw new NotFoundException('workspaceId not found');
          }

          const newChannel = this.channelsRepo.create({
            name: `DM_${currentUserId}_${userId}`,
            topic: 'DM',
            description: 'DM',
            is_dm: true,
            workspace: { id: workspaceId },
            created_by: { id: currentUserId },
            userChannels: [
              {
                user: { id: currentUserId },
                role: ChannelRole.ADMIN,
              },
            ],
          });

          const savedChannel = await this.channelsRepo.save(newChannel);

          messageDto.channelId = savedChannel.id;

          await this.channelsService.addUser(
            {
              channelId: messageDto.channelId,
              userId: userId,
              role: ChannelRole.ADMIN,
            },
            req,
            true,
          );
        } else {
          messageDto.channelId = DMChannel.id;
        }

        const message = await this.createMessageTransaction(
          messageDto,
          currentUserId,
        );
        return message;
      }
    } catch (error) {
      handleError(error);
    }
  }

  async getAllMessagesOfChannel(
    channelId: string,
    req: Request,
    limit: number,
    page: number,
  ) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      if (!userId) {
        throw new NotFoundException('User not found');
      }

      await this.channelsService.checkTheChannel(channelId, userId);

      const safeLimit = Math.max(limit, 1);
      const safePage = Math.max(page, 1);
      const skip = (safePage - 1) * safeLimit;

      //very slow way to do it
      const [messages, total] = await this.messageRepo
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.user', 'user')
        .where('message.channel_id = :channelId', { channelId })
        .orderBy('message.created_at', 'DESC')
        .skip(skip)
        .take(safeLimit)
        .getManyAndCount();

      return {
        total,
        safePage,
        safeLimit,
        data: messages.map((message) => ({
          ...message,
          user: {
            id: message.user.id,
            name: message.user.name,
            avatar: message.user.profile_photo,
            is_active: message.user.is_active,
          },
        })),
      };
    } catch (error) {
      handleError(error);
    }
  }

  async findOne(messageId: string, channelId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      if (!userId) {
        throw new NotFoundException('User not found');
      }

      await this.channelsService.checkTheChannel(channelId, userId);
      const message = await this.messageRepo
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.user', 'user')
        .where('message.id = :messageId', { messageId })
        .andWhere('message.channel_id = :channelId', { channelId })
        .getOne();

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      return {
        ...message,
        user: {
          id: message.user.id,
          name: message.user.name,
          avatar: message.user.profile_photo,
          is_active: message.user.is_active,
        },
      };
    } catch (error) {
      handleError(error);
    }
  }

  async update(
    messageId: string,
    channelId: string,
    updateMessageDto: UpdateMessageDto,
    req: Request,
  ) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      const message = await this.messageRepo.findOne({
        where: {
          id: messageId,
          channel: { id: channelId },
        },
        relations: {
          user: true,
          channel: {
            userChannels: {
              user: true,
            },
          },
        },
      });

      if (!message) {
        throw new NotFoundException('Message not found in this channel');
      }

      const userChannel = message.channel.userChannels.find(
        (uc) => uc.user.id === currentUserId,
      );

      if (!userChannel) {
        throw new NotFoundException('You are not a member of this channel');
      }

      if (message.user.id !== currentUserId) {
        throw new BadRequestException('You are not the owner of this message');
      }

      const result = await this.messageRepo
        .createQueryBuilder()
        .update(Message)
        .set({ ...updateMessageDto })
        .where('id = :messageId', { messageId })
        .andWhere('channel_id = :channelId', { channelId })
        .returning('*')
        .execute();

      const updatedMessage = (result.raw as Message[])[0];
      return updatedMessage;
    } catch (error) {
      handleError(error);
    }
  }

  async remove(messageId: string, channelId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      const channel = await this.channelsRepo.findOne({
        where: { id: channelId, messages: { id: messageId } },
        relations: {
          userChannels: true,
          messages: true,
        },
        select: {
          id: true,
          userChannels: {
            id: true,
          },
          messages: {
            user: {
              id: true,
            },
          },
        },
      });

      if (!channel) {
        throw new NotFoundException('Channel or message not found');
      }

      const userChannel = channel.userChannels.find(
        (userChannel) => userChannel.user.id === currentUserId,
      );
      if (!userChannel) {
        throw new NotFoundException('You are not a member of this channel');
      }

      if (channel.messages[0].user.id !== currentUserId) {
        throw new BadRequestException('You are not the owner of this message');
      }

      await this.messageRepo.delete({
        id: messageId,
        channel: { id: channelId },
      });

      return {
        message: 'Message deleted successfully',
        messageId: messageId,
        channelId: channelId,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async searchMessages(search: string, channelId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      if (!userId) {
        throw new NotFoundException('User not found');
      }

      await this.channelsService.checkTheChannel(channelId, userId);

      const trimmedSearch = search?.trim();
      if (!trimmedSearch || trimmedSearch.length < 2) {
        throw new BadRequestException(
          'Search term must be at least 2 characters.',
        );
      }

      // really bad way to do this
      const messages = await this.messageRepo
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.user', 'user')
        .where('message.channel_id = :channelId', { channelId })
        .andWhere('LOWER(message.content) LIKE LOWER(:search)', {
          search: `%${trimmedSearch}%`,
        })
        .orderBy('message.created_at', 'ASC')
        .getMany();

      if (!messages || messages.length === 0) {
        throw new NotFoundException('No matching messages found.');
      }

      return {
        data: messages.map((message) => ({
          ...message,
          user: {
            id: message.user.id,
            name: message.user.name,
            avatar: message.user.profile_photo,
            is_active: message.user.is_active,
          },
        })),
      };
    } catch (error) {
      handleError(error);
    }
  }

  async getMessageByDate(date: string, channelId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      if (!userId) {
        throw new NotFoundException('User not found');
      }

      await this.channelsService.checkTheChannel(channelId, userId);

      const message = await this.messageRepo
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.user', 'user')
        .where('message.channel_id = :channelId', { channelId })
        .andWhere('DATE(message.created_at) = :date', { date })
        .orderBy('message.created_at', 'ASC')
        .limit(1)
        .getOne();
      if (!message) {
        throw new NotFoundException('No messages found for this date');
      }
      return {
        ...message,
        user: {
          id: message.user.id,
          name: message.user.name,
          avatar: message.user.profile_photo,
          is_active: message.user.is_active,
        },
      };
    } catch (error) {
      handleError(error);
    }
  }
}
