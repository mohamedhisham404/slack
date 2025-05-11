import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channels } from './entities/channel.entity';
import { UserChannel } from './entities/user-channel.entity';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { Workspace } from 'src/workspace/entities/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channels, UserChannel, Workspace]),
    WorkspaceModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
