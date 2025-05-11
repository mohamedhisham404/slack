import { Module } from '@nestjs/common';
import { NotificationWorkspaceService } from './notification-workspace.service';
import { NotificationWorkspaceController } from './notification-workspace.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationWorkspace } from './entities/notification-workspace.entity';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { Workspace } from 'src/workspace/entities/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationWorkspace, Workspace]),
    WorkspaceModule,
  ],
  controllers: [NotificationWorkspaceController],
  providers: [NotificationWorkspaceService],
})
export class NotificationWorkspaceModule {}
