import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channels } from './entities/channel.entity';
import { UserChannel } from './entities/user-channel.entity';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { Attachment } from 'src/attachment/entities/attachment.entity';
import { MinioClientModule } from 'src/minio-client/minio-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channels, UserChannel, Workspace, Attachment]),
    WorkspaceModule,
    MinioClientModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
