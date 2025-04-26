import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment, AttachmentType } from './entities/attachment.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
  ) {}

  private readonly uploadPath = path.join(__dirname, '../../uploads');

  private bytesToMB(bytes: number): number {
    return parseFloat((bytes / (1024 * 1024)).toFixed(2));
  }

  async create(
    file: Express.Multer.File,
    createAttachmentDto: CreateAttachmentDto,
  ) {
    try {
      const { message_id, title, type } = createAttachmentDto;

      try {
        await fs.promises.access(this.uploadPath);
      } catch {
        await fs.promises.mkdir(this.uploadPath, { recursive: true });
      }

      const allowedTypes: AttachmentType[] = [
        'image',
        'video',
        'file',
        'audio',
      ];
      if (!allowedTypes.includes(type)) {
        throw new Error(`Invalid attachment type: ${type}`);
      }

      const attachment = this.attachmentRepository.create({
        message: { id: message_id },
        title,
        type,
        url: path.join(this.uploadPath, file.filename),
        size: this.bytesToMB(file.size),
      });

      return await this.attachmentRepository.save(attachment);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new BadRequestException((error as { message: string }).message);
      }

      throw new BadRequestException('Failed to add message');
    }
  }

  async findAll() {
    const res = await this.attachmentRepository.find({
      relations: {
        message: true,
      },
    });

    if (!res) {
      throw new BadRequestException('Attachments not found');
    }
    return res;
  }

  async findOne(id: number) {
    const res = await this.attachmentRepository.findOne({
      where: { id },
      relations: {
        message: true,
      },
    });

    if (!res) {
      throw new BadRequestException('Attachment not found');
    }
    return res;
  }

  async remove(id: number) {
    try {
      const attachment = await this.attachmentRepository.findOne({
        where: { id },
      });

      if (!attachment) {
        throw new BadRequestException(`Attachment with ID ${id} not found`);
      }

      const filePath = attachment.url;
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }

      await this.attachmentRepository.delete(id);

      return { message: `Attachment with ID ${id} deleted successfully.` };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new BadRequestException((error as { message: string }).message);
      }

      throw new BadRequestException('Failed to delete attachment');
    }
  }
}
