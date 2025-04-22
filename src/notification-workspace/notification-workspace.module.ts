import { Module } from '@nestjs/common';
import { NotificationWorkspaceService } from './notification-workspace.service';
import { NotificationWorkspaceController } from './notification-workspace.controller';

@Module({
  controllers: [NotificationWorkspaceController],
  providers: [NotificationWorkspaceService],
})
export class NotificationWorkspaceModule {}
