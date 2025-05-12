import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guards';
import { UpdateMessageDto } from './dto/update-message.dto';

@UseGuards(AuthGuard)
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(
    @Body() CreateMessageDto: CreateMessageDto,
    @Req() req: Request,
  ) {
    return this.messageService.createMessage(CreateMessageDto, req);
  }

  @Get(':channelId')
  async getAllMessagesOfChannel(
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Req() req: Request,
    @Query('limit') limit = '20',
    @Query('page') page = '1',
  ) {
    const parsedLimit = Math.max(1, parseInt(limit));
    const parsedPage = Math.max(1, parseInt(page));

    return this.messageService.getAllMessagesOfChannel(
      channelId,
      req,
      parsedLimit,
      parsedPage,
    );
  }

  @Get(':messageId/channel/:channelId')
  async findOne(
    @Param('messageId', new ParseUUIDPipe()) messageId: string,
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Req() req: Request,
  ) {
    return this.messageService.findOne(messageId, channelId, req);
  }

  @Patch(':messageId/channel/:channelId')
  async update(
    @Param('messageId', new ParseUUIDPipe()) messageId: string,
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() req: Request,
  ) {
    return this.messageService.update(
      messageId,
      channelId,
      updateMessageDto,
      req,
    );
  }

  @Delete(':messageId/channel/:channelId')
  async remove(
    @Param('messageId', new ParseUUIDPipe()) messageId: string,
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Req() req: Request,
  ) {
    return this.messageService.remove(messageId, channelId, req);
  }

  @Post('search/:channelId')
  async searchMessages(
    @Body('search') search: string,
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Req() req: Request,
  ) {
    return this.messageService.searchMessages(search, channelId, req);
  }

  @Post('date/:channelId')
  async getMessageByDate(
    @Body('date') date: string,
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
    @Req() req: Request,
  ) {
    return this.messageService.getMessageByDate(date, channelId, req);
  }
}
