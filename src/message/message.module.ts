import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Channels } from 'src/channels/entities/channel.entity';
import { ChannelsModule } from 'src/channels/channels.module';
import { EventsModule } from 'src/events/events.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Channels, User]),
    ChannelsModule,
    EventsModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
