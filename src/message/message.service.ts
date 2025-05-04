import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateChannelMessageDto,
  CreateDMMessageDTO,
} from './dto/create-message.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { Channels } from 'src/channels/entities/channel.entity';
import { ChannelsService } from 'src/channels/channels.service';
import { EventsGateway } from 'src/events/events.gateway';
import {
  ChannelRole,
  UserChannel,
} from 'src/channels/entities/user-channel.entity';
import { User } from 'src/user/entities/user.entity';
import { UpdateMessageDto } from './dto/update-message.dto';
import { handleError } from 'src/utils/errorHandling';
import { CustomSocket } from 'src/events/types/socket.interface';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,

    @InjectRepository(Channels)
    private readonly channelsRepo: Repository<Channels>,

    @InjectRepository(UserChannel)
    private readonly userChannelRepo: Repository<UserChannel>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly channelsService: ChannelsService,

    private readonly eventsGateway: EventsGateway,
  ) {}

  async createChannelMessage(
    CreateChannelMessageDto: CreateChannelMessageDto,
    req: Request,
  ) {
    try {
      const { content, channel_id, parent_message_id, is_pinned, attachments } =
        CreateChannelMessageDto;
      const userId = req.user.userId;

      if (!content && !attachments) {
        throw new BadRequestException(
          'Message content or attachments are required',
        );
      }

      const channel = await this.channelsRepo.findOne({
        where: { id: channel_id },
      });
      if (!channel) {
        throw new NotFoundException('Channel not found');
      }

      const userChannel = await this.userChannelRepo.findOne({
        where: {
          channel: { id: channel_id },
          user: { id: userId },
        },
      });
      if (!userChannel) {
        throw new BadRequestException('you are not in this channel');
      }

      if (parent_message_id) {
        const parentMessage = await this.messageRepo.findOne({
          where: { id: parent_message_id },
        });
        if (!parentMessage) {
          throw new NotFoundException('Parent message not found');
        }
        parentMessage.reply_count += 1;
        await this.messageRepo.save(parentMessage);
      }

      if (channel.admin_only && userChannel.role !== ChannelRole.ADMIN) {
        throw new BadRequestException(
          'Only admins can send messages in this channel',
        );
      }

      const message = this.messageRepo.create({
        content,
        is_pinned,
        parent_message: parent_message_id,
        channel: { id: channel_id },
        user: { id: userId },
      });
      const savedMessage = await this.messageRepo.save(message);

      const socketId = this.eventsGateway.users.get(userId);
      let senderSocket: CustomSocket | undefined = undefined;

      if (socketId) {
        senderSocket = this.eventsGateway.server.sockets.sockets.get(socketId);
      }

      this.eventsGateway.sendMessageToChannel(
        channel_id,
        savedMessage,
        senderSocket,
      );

      return savedMessage;
    } catch (error) {
      handleError(error);
    }
  }

  async createUserMessage(
    CreateDMMessageDTO: CreateDMMessageDTO,
    req: Request,
  ) {
    try {
      const {
        content,
        receiver_id,
        parent_message_id,
        is_pinned,
        attachments,
      } = CreateDMMessageDTO;
      const userId = req.user.userId;

      if (!content && !attachments) {
        throw new BadRequestException(
          'Message content or attachments are required',
        );
      }

      const receiver = await this.userRepo.findOne({
        where: { id: receiver_id },
      });
      if (!receiver) {
        throw new NotFoundException('Receiver not found');
      }

      const dmChannelName =
        userId === receiver_id
          ? `dm-user-${userId}`
          : `dm-user-${Math.min(userId, receiver_id)}-${Math.max(
              userId,
              receiver_id,
            )}`;

      let channel = await this.channelsRepo.findOne({
        where: {
          name: dmChannelName,
          is_dm: true,
          workspace: { id: 1 },
        },
        relations: ['workspace'],
      });

      if (!channel) {
        channel = await this.channelsService.create(
          {
            workspace_id: 1,
            name: dmChannelName,
            topic: 'Direct Message',
            description: 'Direct Message',
            is_private: true,
            is_dm: true,
          },
          req,
          true,
        );
      }

      const userIdsToAdd =
        userId === receiver_id ? [userId] : [userId, receiver_id];
      for (const id of userIdsToAdd) {
        const exists = await this.userChannelRepo.findOne({
          where: {
            user: { id },
            channel: { id: channel.id },
          },
        });

        if (!exists) {
          await this.channelsService.addUser(
            {
              channel_id: channel.id,
              user_id: id,
              role: ChannelRole.ADMIN,
            },
            req,
          );
        }
      }

      if (parent_message_id) {
        const parentMessage = await this.messageRepo.findOne({
          where: { id: parent_message_id },
        });
        if (!parentMessage) {
          throw new NotFoundException('Parent message not found');
        }
        parentMessage.reply_count += 1;
        await this.messageRepo.save(parentMessage);
      }

      const message = this.messageRepo.create({
        content,
        channel: { id: channel.id },
        user: { id: userId },
        is_pinned,
        parent_message: parent_message_id,
      });

      const savedMessage = await this.messageRepo.save(message);

      this.eventsGateway.sendDirectMessage(receiver_id, message);
      return savedMessage;
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async getAllMessagesOfChannel(
    channelId: number,
    req: Request,
    limit: number,
    page: number,
  ) {
    try {
      const userId = req.user.userId;
      await this.channelsService.checkTheChannel(channelId, userId);

      const safeLimit = Math.max(limit, 1);
      const safePage = Math.max(page, 1);
      const skip = (safePage - 1) * safeLimit;

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

  async findOne(messageId: number, channelId: number, req: Request) {
    try {
      const userId = req.user.userId;
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
    messageId: number,
    channelId: number,
    updateMessageDto: UpdateMessageDto,
    req: Request,
  ) {
    const userId = req.user.userId;
    await this.channelsService.checkTheChannel(channelId, userId);

    const message = await this.messageRepo.findOne({
      where: { id: messageId, channel: { id: channelId } },
      relations: ['user'],
      select: {
        id: true,
        content: true,
        is_pinned: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        user: {
          id: true,
          name: true,
          profile_photo: true,
          is_active: true,
        },
      },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.deleted_at) {
      throw new BadRequestException('Message is deleted');
    }
    if (message.user.id !== userId) {
      throw new BadRequestException('You are not the owner of this message');
    }
    if (updateMessageDto.content) {
      message.content = updateMessageDto.content;
    }
    if (updateMessageDto.is_pinned !== undefined) {
      message.is_pinned = updateMessageDto.is_pinned;
    }

    message.updated_at = new Date();
    const updatedMessage = await this.messageRepo.save(message);
    return {
      ...updatedMessage,
    };
  }

  async remove(messageId: number, channelId: number, req: Request) {
    const userId = req.user.userId;
    await this.channelsService.checkTheChannel(channelId, userId);

    const message = await this.messageRepo.findOne({
      where: { id: messageId, channel: { id: channelId } },
      relations: ['user'],
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.deleted_at) {
      throw new BadRequestException('Message is already deleted');
    }
    if (message.user.id !== userId) {
      throw new BadRequestException('You are not the owner of this message');
    }

    message.deleted_at = new Date();
    await this.messageRepo.save(message);
    return {
      message: 'Message deleted successfully',
    };
  }

  async searchMessages(search: string, channelId: number, req: Request) {
    try {
      const userId = req.user.userId;
      await this.channelsService.checkTheChannel(channelId, userId);

      const trimmedSearch = search?.trim();
      if (!trimmedSearch || trimmedSearch.length < 2) {
        throw new BadRequestException(
          'Search term must be at least 2 characters.',
        );
      }

      const messages = await this.messageRepo
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.user', 'user')
        .where('message.channel_id = :channelId', { channelId })
        .andWhere('message.deleted_at IS NULL')
        .andWhere('LOWER(message.content) LIKE LOWER(:search)', {
          search: `%${trimmedSearch}%`,
        })
        .orderBy('message.created_at', 'DESC')
        .getMany();

      if (messages.length === 0) {
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

  async getMessageByDate(date: string, channelId: number, req: Request) {
    try {
      const userId = req.user.userId;
      await this.channelsService.checkTheChannel(channelId, userId);

      const message = await this.messageRepo
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.user', 'user')
        .where('message.channel_id = :channelId', { channelId })
        .andWhere('DATE(message.created_at) = :date', { date })
        .andWhere('message.deleted_at IS NULL')
        .orderBy('message.created_at', 'DESC')
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
