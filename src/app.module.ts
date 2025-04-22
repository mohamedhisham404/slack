import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { WorkspaceUsersModule } from './workspace-users/workspace-users.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { ChannelsModule } from './channels/channels.module';
import { ChannelUsersModule } from './channel-users/channel-users.module';
import { MessageModule } from './message/message.module';
import { AttachmentModule } from './attachment/attachment.module';
import { MentionsModule } from './mentions/mentions.module';
import { EmojyModule } from './emojy/emojy.module';
import { MessageEmojiModule } from './message-emoji/message-emoji.module';
import { NotificationChannelModule } from './notification-channel/notification-channel.module';
import { NotificationWorkspaceModule } from './notification-workspace/notification-workspace.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
    WorkspaceModule,
    WorkspaceUsersModule,
    UserPreferencesModule,
    ChannelsModule,
    ChannelUsersModule,
    MessageModule,
    AttachmentModule,
    MentionsModule,
    EmojyModule,
    MessageEmojiModule,
    NotificationChannelModule,
    NotificationWorkspaceModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
