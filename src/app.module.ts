import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ChannelsModule } from './channels/channels.module';
import { NotificationWorkspaceModule } from './notification-workspace/notification-workspace.module';
import { EventsModule } from './events/events.module';
import { MessageModule } from './message/message.module';
import { MinioClientModule } from './minio-client/minio-client.module';
import { AttachmentModule } from './attachment/attachment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
      global: true,
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),

    DatabaseModule,
    UserModule,
    AuthModule,
    UserPreferencesModule,
    WorkspaceModule,
    ChannelsModule,
    NotificationWorkspaceModule,
    EventsModule,
    MessageModule,
    MinioClientModule,
    AttachmentModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
