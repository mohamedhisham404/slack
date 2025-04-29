import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserChannel } from 'src/channels/entities/user-channel.entity';
import { ChannelsModule } from 'src/channels/channels.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { UserWorkspace } from 'src/workspace/entities/user-workspace.entity';
import { UserPreferences } from 'src/user-preferences/entities/user-preference.entity';
import { NotificationWorkspace } from 'src/notification-workspace/entities/notification-workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserChannel,
      UserWorkspace,
      UserPreferences,
      NotificationWorkspace,
    ]),
    ChannelsModule,
    WorkspaceModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
