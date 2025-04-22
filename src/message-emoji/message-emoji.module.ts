import { Module } from '@nestjs/common';
import { MessageEmojiService } from './message-emoji.service';
import { MessageEmojiController } from './message-emoji.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEmoji } from './entities/message-emoji.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEmoji])],
  controllers: [MessageEmojiController],
  providers: [MessageEmojiService],
})
export class MessageEmojiModule {}
