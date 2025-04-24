import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
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

  async create(createMessageDto: CreateMessageDto, req: Request) {
    try {
      const userId = req.user.userId;
      const {
        channel_id,
        content,
        parent_message,
        is_pinned,
        attachments,
        is_dm,
        receiver_id,
      } = createMessageDto;

      if (!content && !attachments) {
        throw new BadRequestException(
          'Message content or attachments are required',
        );
      }

      if (!channel_id && !receiver_id) {
        throw new BadRequestException('Channel ID or Receiver ID is required');
      }

      if (channel_id && receiver_id) {
        throw new BadRequestException(
          'Channel ID and Receiver ID cannot be used together',
        );
      }

      if (is_dm && !receiver_id) {
        throw new BadRequestException('Receiver ID is required for DM');
      }

      if (receiver_id) {
        const receiver = await this.userRepo.findOne({
          where: { id: receiver_id },
        });
        if (!receiver) {
          throw new BadRequestException('Receiver not found');
        }
      }

      if (receiver_id == userId) {
        throw new BadRequestException(
          'You cannot send a message to yourself right now',
        );
      }

      if (!channel_id && is_dm && receiver_id) {
        const channel = await this.channelsRepo
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

        if (channel) {
          createMessageDto.channel_id = channel.id;
        } else {
          const newDMChannel = await this.channelsService.create(
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
              channel_id: newDMChannel.id,
              user_id: receiver_id,
              role: ChannelRole.ADMIN,
            },
            req,
          );

          createMessageDto.channel_id = newDMChannel.id;
        }
      }

      if (parent_message) {
        const parentMessage = await this.messageRepo.findOne({
          where: { id: parent_message },
        });
        if (!parentMessage) {
          throw new BadRequestException('Parent message not found');
        }
        parentMessage.reply_count += 1;
        await this.messageRepo.save(parentMessage);
      }

      const channel = await this.channelsRepo.findOne({
        where: { id: channel_id },
      });
      if (!channel) {
        throw new BadRequestException('Channel not found');
      }
      const message = this.messageRepo.create({
        content,
        channel,
        user: { id: userId },
        parent_message,
        is_pinned,
        attachments,
      });

      this.eventsGateway.SendMessage({ ...message, is_dm });
      const savedMessage = await this.messageRepo.save(message);
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

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
