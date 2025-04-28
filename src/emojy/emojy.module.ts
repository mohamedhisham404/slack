import { Module } from '@nestjs/common';
import { EmojyService } from './emojy.service';
import { EmojyController } from './emojy.controller';
import { Emojy } from './entities/emojy.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChannel } from 'src/channels/entities/user-channel.entity';
import { Message } from 'src/message/entities/message.entity';
import { MessageReaction } from 'src/message/entities/message-reaction.entity';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { ChannelsModule } from 'src/channels/channels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Emojy, UserChannel, Message, MessageReaction]),
    WorkspaceModule,
    ChannelsModule,
  ],
  controllers: [EmojyController],
  providers: [EmojyService],
})
export class EmojyModule {}
