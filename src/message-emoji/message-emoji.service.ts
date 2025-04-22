import { Injectable } from '@nestjs/common';
import { CreateMessageEmojiDto } from './dto/create-message-emoji.dto';
import { UpdateMessageEmojiDto } from './dto/update-message-emoji.dto';

@Injectable()
export class MessageEmojiService {
  create(createMessageEmojiDto: CreateMessageEmojiDto) {
    return 'This action adds a new messageEmoji';
  }

  findAll() {
    return `This action returns all messageEmoji`;
  }

  findOne(id: number) {
    return `This action returns a #${id} messageEmoji`;
  }

  update(id: number, updateMessageEmojiDto: UpdateMessageEmojiDto) {
    return `This action updates a #${id} messageEmoji`;
  }

  remove(id: number) {
    return `This action removes a #${id} messageEmoji`;
  }
}
