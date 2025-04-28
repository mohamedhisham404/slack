import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmojyDto } from './dto/create-emojy.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Emojy } from './entities/emojy.entity';
import { Repository } from 'typeorm';
import { handleError } from 'src/utils/errorHandling';
import { CreateMessageReactionDto } from './dto/create-message-emojy.dto';
import { Message } from 'src/message/entities/message.entity';
import { MessageReaction } from 'src/message/entities/message-reaction.entity';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { ChannelsService } from 'src/channels/channels.service';

@Injectable()
export class EmojyService {
  constructor(
    private readonly WorkspaceService: WorkspaceService,
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
    workspaceId: number,
    req: Request,
  ) {
    try {
      const userId = req.user.userId;
      await this.WorkspaceService.checkWorkspace(workspaceId, userId);

      const emojy = this.emojyRepository.create({
        name: createEmojyDto.name,
        unicode: createEmojyDto.unicode,
        workspace: { id: workspaceId },
      });

      const emojyCreated = await this.emojyRepository.save(emojy);
      return emojyCreated;
    } catch (error) {
      handleError(error);
    }
  }

  async findAll(workspaceId: number, req: Request) {
    try {
      const userId = req.user.userId;
      await this.WorkspaceService.checkWorkspace(workspaceId, userId);

      const emojies = await this.emojyRepository.find({
        where: { workspace: { id: workspaceId } },
        relations: ['workspace'],
        select: {
          id: true,
          name: true,
          unicode: true,
        },
      });

      if (!emojies || emojies.length === 0) {
        throw new NotFoundException('No emojis found');
      }

      return emojies;
    } catch (error) {
      handleError(error);
    }
  }

  async findOne(emojyId: number, workspaceId: number, req: Request) {
    try {
      const userId = req.user.userId;
      await this.WorkspaceService.checkWorkspace(workspaceId, userId);

      const emojy = await this.emojyRepository.findOne({
        where: { id: emojyId, workspace: { id: workspaceId } },
        relations: ['workspace'],
      });

      if (!emojy) {
        throw new NotFoundException('Emoji not found');
      }

      return emojy;
    } catch (error) {
      handleError(error);
    }
  }

  async setEmojyToMessage(
    createMessageReactionDto: CreateMessageReactionDto,
    req: Request,
  ) {
    try {
      const userId = req.user.userId;
      const { messageId, emojyId } = createMessageReactionDto;

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
        throw new NotFoundException('Emoji not found');
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
          // Same emoji → remove reaction (unreact)
          await this.messageReactionRepo.remove(existingReaction);
          return { message: 'Reaction removed' };
        } else {
          // Different emoji → update the reaction
          existingReaction.emojy = emojy;
          await this.messageReactionRepo.save(existingReaction);
          return { message: 'Reaction updated' };
        }
      }

      // No existing reaction → create new
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
