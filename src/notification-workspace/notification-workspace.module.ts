import { Module } from '@nestjs/common';
import { NotificationWorkspaceService } from './notification-workspace.service';
import { NotificationWorkspaceController } from './notification-workspace.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationWorkspace } from './entities/notification-workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationWorkspace])],
  controllers: [NotificationWorkspaceController],
  providers: [NotificationWorkspaceService],
})
export class NotificationWorkspaceModule {}
