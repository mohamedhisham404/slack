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
} from '@nestjs/common';
import { MessageService } from './message.service';
import {
  CreateChannelMessageDto,
  CreateDMMessageDTO,
} from './dto/create-message.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guards';

@UseGuards(AuthGuard)
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('channel')
  async createChannelMessage(
    @Body() CreateChannelMessageDto: CreateChannelMessageDto,
    @Req() req: Request,
  ) {
    return this.messageService.createChannelMessage(
      CreateChannelMessageDto,
      req,
    );
  }

  @Post('user')
  async createUserMessage(
    @Body() CreateDMMessageDTO: CreateDMMessageDTO,
    @Req() req: Request,
  ) {
    return this.messageService.createUserMessage(CreateDMMessageDTO, req);
  }

  @Get()
  findAll() {
    return this.messageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
  //   return this.messageService.update(+id, updateMessageDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(+id);
  }
}
