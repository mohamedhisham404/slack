import { Injectable } from '@nestjs/common';
import { CreateNotificationWorkspaceDto } from './dto/create-notification-workspace.dto';
import { UpdateNotificationWorkspaceDto } from './dto/update-notification-workspace.dto';

@Injectable()
export class NotificationWorkspaceService {
  create(createNotificationWorkspaceDto: CreateNotificationWorkspaceDto) {
    return 'This action adds a new notificationWorkspace';
  }

  findAll() {
    return `This action returns all notificationWorkspace`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notificationWorkspace`;
  }

  update(id: number, updateNotificationWorkspaceDto: UpdateNotificationWorkspaceDto) {
    return `This action updates a #${id} notificationWorkspace`;
  }

  remove(id: number) {
    return `This action removes a #${id} notificationWorkspace`;
  }
}
