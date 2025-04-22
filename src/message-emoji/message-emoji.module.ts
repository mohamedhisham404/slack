import { Module } from '@nestjs/common';
import { MessageEmojiService } from './message-emoji.service';
import { MessageEmojiController } from './message-emoji.controller';

@Module({
  controllers: [MessageEmojiController],
  providers: [MessageEmojiService],
})
export class MessageEmojiModule {}
