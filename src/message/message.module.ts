import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageReaction } from './entities/message-reaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, MessageReaction])],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
