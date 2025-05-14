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
  ParseUUIDPipe,
} from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/guards/auth.guards';
import { Request } from 'express';
import { memoryStorage } from 'multer';

@Controller('attachment')
@UseGuards(AuthGuard)
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      storage: memoryStorage(),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAttachmentDto: CreateAttachmentDto,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return await this.attachmentService.create(file, createAttachmentDto, req);
  }

  @Get('channel/:channelId')
  async findAllByChannel(
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Req() req: Request,
  ) {
    return this.attachmentService.findAllByChannel(channelId, req);
  }

  @Get(':attachmentId/channel/:channelId')
  async findOneByChannel(
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Param('attachmentId', new ParseUUIDPipe()) attachmentId: string,
    @Req() req: Request,
  ) {
    return this.attachmentService.findOneByChannel(
      channelId,
      attachmentId,
      req,
    );
  }

  @Delete(':attachmentId/channel/:channelId')
  async remove(
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Param('attachmentId', new ParseUUIDPipe()) attachmentId: string,
    @Req() req: Request,
  ) {
    return this.attachmentService.remove(channelId, attachmentId, req);
  }
}
