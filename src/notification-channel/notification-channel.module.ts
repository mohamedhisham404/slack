import { Module } from '@nestjs/common';
import { NotificationChannelService } from './notification-channel.service';
import { NotificationChannelController } from './notification-channel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationChannel } from './entities/notification-channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationChannel])],
  controllers: [NotificationChannelController],
  providers: [NotificationChannelService],
})
export class NotificationChannelModule {}
