import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment } from './entities/attachment.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { handleError } from 'src/utils/errorHandling';
import { ChannelsService } from 'src/channels/channels.service';
import { Message } from 'src/message/entities/message.entity';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { getUserFromRequest } from 'src/utils/get-user';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,

    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    private minioClientService: MinioClientService,

    private readonly channelsService: ChannelsService,
  ) {}

  private bytesToMB(bytes: number): number {
    return parseFloat((bytes / (1024 * 1024)).toFixed(2));
  }

  async create(
    file: Express.Multer.File,
    createAttachmentDto: CreateAttachmentDto,
    req: Request,
  ) {
    const { channelId, type } = createAttachmentDto;

    const userReq = getUserFromRequest(req);
    const userId = userReq?.userId;

    const queryRunner =
      this.attachmentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!userId) {
        throw new NotFoundException('User not found');
      }

      await this.channelsService.checkTheChannel(channelId, userId);

      const message = await this.messageRepository.save({
        channel: { id: channelId },
        content: file.originalname,
      });

      const uploadedFile = await this.minioClientService.upload(
        file.buffer,
        file.originalname,
        file.mimetype,
        type,
      );

      const attachment = this.attachmentRepository.create({
        title: file.originalname,
        type,
        size: this.bytesToMB(file.size),
        url: uploadedFile.url,
        message,
      });

      const result = await this.attachmentRepository.save(attachment);

      await queryRunner.commitTransaction();

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      handleError(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllByChannel(channelId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      if (!userId) {
        throw new NotFoundException('User not found');
      }

      await this.channelsService.checkTheChannel(channelId, userId);

      const attachments = await this.attachmentRepository.find({
        where: {
          message: { channel: { id: channelId } },
        },
      });

      if (!attachments || attachments.length === 0) {
        throw new NotFoundException('Attachments not found');
      }

      return attachments;
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async findOneByChannel(
    channelId: string,
    attachmentId: string,
    req: Request,
  ) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      if (!userId) {
        throw new NotFoundException('User not found');
      }

      await this.channelsService.checkTheChannel(channelId, userId);

      const attachment = await this.attachmentRepository.findOne({
        where: {
          id: attachmentId,
          message: { channel: { id: channelId } },
        },
      });

      if (!attachment) {
        throw new NotFoundException('Attachment not found');
      }

      return attachment;
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async remove(channelId: string, attachmentId: string, req: Request) {
    const userReq = getUserFromRequest(req);
    const userId = userReq?.userId;

    if (!userId) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.channelsService.checkTheChannel(channelId, userId);
      const attachment = await this.attachmentRepository.findOne({
        where: { id: attachmentId },
      });

      if (!attachment) {
        throw new NotFoundException('Attachment not found');
      }

      const objectName = attachment.url.split('/').pop();
      if (!objectName) {
        throw new NotFoundException('Object name not found in URL');
      }
      await this.minioClientService.delete(objectName, attachment.type);

      await this.attachmentRepository.delete(attachmentId);

      return {
        message: 'Attachment deleted successfully',
      };
    } catch (error: unknown) {
      handleError(error);
    }
  }
}
