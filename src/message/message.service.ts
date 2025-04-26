import { BadRequestException, Injectable } from '@nestjs/common';
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
      throw new BadRequestException('Channel not found');
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
        throw new BadRequestException('Parent message not found');
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

    this.eventsGateway.sendMessageToChannel(channel_id, message);
    return savedMessage;
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

      if (receiver_id === userId) {
        throw new BadRequestException(
          'You cannot send a message to yourself right now',
        );
      }

      if (!content && !attachments) {
        throw new BadRequestException(
          'Message content or attachments are required',
        );
      }

      const receiver = await this.userRepo.findOne({
        where: { id: receiver_id },
      });
      if (!receiver) {
        throw new BadRequestException('Receiver not found');
      }

      let channel = await this.channelsRepo
        .createQueryBuilder('channel')
        .innerJoin('channel.userChannels', 'uc')
        .where('channel.is_dm = :isDM', { isDM: true })
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('uc2.channel_id')
            .from(UserChannel, 'uc2')
            .where('uc2.user_id IN (:...userIds)', {
              userIds: [userId, receiver_id],
            })
            .groupBy('uc2.channel_id')
            .having('COUNT(DISTINCT uc2.user_id) = 2')
            .getQuery();

          return 'channel.id IN (' + subQuery + ')';
        })
        .getOne();
      if (!channel) {
        channel = await this.channelsService.create(
          {
            workspace_id: 1,
            name: 'Direct Message',
            topic: 'Direct Message',
            description: 'Direct Message',
            is_private: true,
            is_dm: true,
          },
          req,
        );
        await this.channelsService.addUser(
          {
            channel_id: channel.id,
            user_id: receiver_id,
            role: ChannelRole.ADMIN,
          },
          req,
        );
      }

      if (parent_message_id) {
        const parentMessage = await this.messageRepo.findOne({
          where: { id: parent_message_id },
        });
        if (!parentMessage) {
          throw new BadRequestException('Parent message not found');
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
      if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new BadRequestException((error as { message: string }).message);
      }

      throw new BadRequestException('Failed to add message');
    }
  }

  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
