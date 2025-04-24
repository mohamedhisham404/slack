import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { MessagesGateway } from './messages.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Message, MessageReaction])],
  controllers: [MessageController],
  providers: [MessageService, MessagesGateway],
})
export class MessageModule {}
