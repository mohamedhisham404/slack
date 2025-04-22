import { Injectable } from '@nestjs/common';
import { CreateNotificationChannelDto } from './dto/create-notification-channel.dto';
import { UpdateNotificationChannelDto } from './dto/update-notification-channel.dto';

@Injectable()
export class NotificationChannelService {
  create(createNotificationChannelDto: CreateNotificationChannelDto) {
    return 'This action adds a new notificationChannel';
  }

  findAll() {
    return `This action returns all notificationChannel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notificationChannel`;
  }

  update(id: number, updateNotificationChannelDto: UpdateNotificationChannelDto) {
    return `This action updates a #${id} notificationChannel`;
  }

  remove(id: number) {
    return `This action removes a #${id} notificationChannel`;
  }
}
