import { Module } from '@nestjs/common';
import { EmojyService } from './emojy.service';
import { EmojyController } from './emojy.controller';
import { Emojy } from './entities/emojy.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChannel } from 'src/channels/entities/user-channel.entity';
import { ChannelsModule } from 'src/channels/channels.module';
import { Message } from 'src/message/entities/message.entity';
import { MessageReaction } from 'src/message/entities/message-reaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Emojy, UserChannel, Message, MessageReaction]),
    ChannelsModule,
  ],
  controllers: [EmojyController],
  providers: [EmojyService],
})
export class EmojyModule {}
