import { Module } from '@nestjs/common';
import { NotificationChannelService } from './notification-channel.service';
import { NotificationChannelController } from './notification-channel.controller';

@Module({
  controllers: [NotificationChannelController],
  providers: [NotificationChannelService],
})
export class NotificationChannelModule {}
