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
  UseGuards,
  Req,
} from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from 'src/guards/auth.guards';
import { Request } from 'express';

@Controller('attachment')
@UseGuards(AuthGuard)
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

  @Get('channel/:channel_id')
  async findAllByChannel(
    @Param('channel_id') channel_id: string,
    @Req() req: Request,
  ) {
    return this.attachmentService.findAllByChannel(+channel_id, req);
  }

  @Get(':attachment_id/channel/:channel_id')
  async findOneByChannel(
    @Param('channel_id') channelId: string,
    @Param('attachment_id') attachmentId: string,
    @Req() req: Request,
  ) {
    return this.attachmentService.findOneByChannel(
      +channelId,
      +attachmentId,
      req,
    );
  }

  @Delete(':attachment_id/channel/:channel_id')
  async remove(
    @Param('channel_id') channelId: string,
    @Param('attachment_id') attachmentId: string,
    @Req() req: Request,
  ) {
    return this.attachmentService.remove(+channelId, +attachmentId, req);
  }
}
