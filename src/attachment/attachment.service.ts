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

  create(file: Express.Multer.File, createAttachmentDto: CreateAttachmentDto) {
    try {
      const { message_id, title, type } = createAttachmentDto;

      if (!fs.existsSync(this.uploadPath)) {
        fs.mkdirSync(this.uploadPath, { recursive: true });
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

      return this.attachmentRepository.save(attachment);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new BadRequestException((error as { message: string }).message);
      }

      throw new BadRequestException('Failed to add message');
    }
  }

  findAll() {
    return `This action returns all attachment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} attachment`;
  }

  remove(id: number) {
    return `This action removes a #${id} attachment`;
  }
}
