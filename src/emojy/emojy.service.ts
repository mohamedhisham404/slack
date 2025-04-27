import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmojyDto } from './dto/create-emojy.dto';
import { Request } from 'express';
import { ChannelsService } from 'src/channels/channels.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Emojy } from './entities/emojy.entity';
import { Repository } from 'typeorm';
import { handleError } from 'src/utils/errorHandling';
import { CreateMessageReactionDto } from './dto/create-message-emojy.dto';
import { Message } from 'src/message/entities/message.entity';
import { MessageReaction } from 'src/message/entities/message-reaction.entity';

@Injectable()
export class EmojyService {
  constructor(
    private readonly channelsService: ChannelsService,

    @InjectRepository(Emojy)
    private emojyRepository: Repository<Emojy>,

    @InjectRepository(Message)
    private messageRepo: Repository<Message>,

    @InjectRepository(MessageReaction)
    private messageReactionRepo: Repository<MessageReaction>,
  ) {}

  async create(
    createEmojyDto: CreateEmojyDto,
    channelId: number,
    req: Request,
  ) {
    try {
      const userId = req.user.userId;
      await this.channelsService.checkTheChannel(channelId, userId);

      const emojy = this.emojyRepository.create({
        name: createEmojyDto.name,
        channel: { id: channelId },
        unicode: createEmojyDto.unicode,
      });

      const emojyCreated = await this.emojyRepository.save(emojy);
      return emojyCreated;
    } catch (error) {
      handleError(error);
    }
  }

  async findAll(channelId: number, req: Request) {
    const userId = req.user.userId;
    await this.channelsService.checkTheChannel(channelId, userId);

    const emojies = await this.emojyRepository.find({
      where: { channel: { id: channelId } },
      relations: ['channel'],
      select: {
        id: true,
        name: true,
        unicode: true,
      },
    });

    if (!emojies) {
      throw new NotFoundException('No emojies found');
    }

    return emojies;
  }

  async findOne(emojyId: number, channelId: number, req: Request) {
    try {
      const userId = req.user.userId;
      await this.channelsService.checkTheChannel(channelId, userId);

      const emojy = await this.emojyRepository.findOne({
        where: { id: emojyId, channel: { id: channelId } },
        relations: ['channel'],
      });

      if (!emojy) {
        throw new NotFoundException('Emojy not found');
      }

      return emojy;
    } catch (error) {
      handleError(error);
    }
  }

  async setEmojyToMessage(
    CreateMessageReactionDto: CreateMessageReactionDto,
    req: Request,
  ) {
    try {
      const userId = req.user.userId;
      const { messageId, emojyId } = CreateMessageReactionDto;

      const message = await this.messageRepo.findOne({
        where: { id: messageId },
        select: ['id', 'channel_id'],
      });
      if (!message) {
        throw new NotFoundException('Message not found');
      }

      await this.channelsService.checkTheChannel(message.channel_id, userId);

      const emojy = await this.emojyRepository.findOne({
        where: { id: emojyId },
      });
      if (!emojy) {
        throw new NotFoundException('Emojy not found');
      }

      const existingReaction = await this.messageReactionRepo.findOne({
        where: {
          message: { id: messageId },
          user: { id: userId },
        },
        relations: ['emojy'],
      });

      if (existingReaction) {
        if (existingReaction.emojy.id === emojyId) {
          // Same emoji → unreact (remove reaction)
          await this.messageReactionRepo.remove(existingReaction);
          return { message: 'Reaction removed' };
        } else {
          // Different emoji → update to new emoji
          existingReaction.emojy = emojy;
          await this.messageReactionRepo.save(existingReaction);
          return { message: 'Reaction updated' };
        }
      }

      const newReaction = this.messageReactionRepo.create({
        message: { id: messageId },
        user: { id: userId },
        emojy: emojy,
      });
      await this.messageReactionRepo.save(newReaction);

      return { message: 'Reaction added' };
    } catch (error) {
      handleError(error);
    }
  }
}
