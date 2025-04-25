import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('attachment')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.attachmentService.create(file, createAttachmentDto);
  }

  @Get()
  findAll() {
    return this.attachmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attachmentService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attachmentService.remove(+id);
  }
}
