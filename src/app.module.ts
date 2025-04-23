import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { ChannelsModule } from './channels/channels.module';
import { MessageModule } from './message/message.module';
import { AttachmentModule } from './attachment/attachment.module';
import { MentionsModule } from './mentions/mentions.module';
import { EmojyModule } from './emojy/emojy.module';
import { NotificationChannelModule } from './notification-channel/notification-channel.module';
import { NotificationWorkspaceModule } from './notification-workspace/notification-workspace.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import config from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, load: [config] }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('JWT.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    DatabaseModule,
    UserModule,
    WorkspaceModule,
    UserPreferencesModule,
    ChannelsModule,
    MessageModule,
    AttachmentModule,
    MentionsModule,
    EmojyModule,
    NotificationChannelModule,
    NotificationWorkspaceModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
