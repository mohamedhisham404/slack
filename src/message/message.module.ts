import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { Channels } from 'src/channels/entities/channel.entity';
import { ChannelsModule } from 'src/channels/channels.module';
import { EventsModule } from 'src/events/events.module';
import { UserChannel } from 'src/channels/entities/user-channel.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      MessageReaction,
      Channels,
      UserChannel,
      User,
    ]),
    ChannelsModule,
    EventsModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
