import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessageEmojiService } from './message-emoji.service';
import { CreateMessageEmojiDto } from './dto/create-message-emoji.dto';
import { UpdateMessageEmojiDto } from './dto/update-message-emoji.dto';

@Controller('message-emoji')
export class MessageEmojiController {
  constructor(private readonly messageEmojiService: MessageEmojiService) {}

  @Post()
  create(@Body() createMessageEmojiDto: CreateMessageEmojiDto) {
    return this.messageEmojiService.create(createMessageEmojiDto);
  }

  @Get()
  findAll() {
    return this.messageEmojiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageEmojiService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageEmojiDto: UpdateMessageEmojiDto) {
    return this.messageEmojiService.update(+id, updateMessageEmojiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageEmojiService.remove(+id);
  }
}
