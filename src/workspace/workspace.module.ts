import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { UserWorkspace } from './entities/user-workspace.entity';
import { Channels } from 'src/channels/entities/channel.entity';
import { UserChannel } from 'src/channels/entities/user-channel.entity';
import { User } from 'src/user/entities/user.entity';
import { NotificationWorkspace } from 'src/notification-workspace/entities/notification-workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspace,
      UserWorkspace,
      Channels,
      UserChannel,
      User,
      NotificationWorkspace,
    ]),
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
