import { Injectable } from '@nestjs/common';
import { UpdateNotificationWorkspaceDto } from './dto/update-notification-workspace.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationWorkspace } from './entities/notification-workspace.entity';
import { Repository } from 'typeorm';
import { handleError } from 'src/utils/errorHandling';

@Injectable()
export class NotificationWorkspaceService {
  constructor(
    @InjectRepository(NotificationWorkspace)
    private readonly notificationWorkspaceRepository: Repository<NotificationWorkspace>,
  ) {}

  async findOne(req: Request) {
    try {
      const userId = req.user.userId;

      const notificationWorkspace =
        await this.notificationWorkspaceRepository.findOne({
          where: { user_id: userId },
        });

      return notificationWorkspace;
    } catch (error) {
      handleError(error);
    }
  }

  async update(
    req: Request,
    updateNotificationWorkspaceDto: UpdateNotificationWorkspaceDto,
  ) {
    try {
      const userId = req.user.userId;

      await this.notificationWorkspaceRepository.update(
        { user_id: userId },
        updateNotificationWorkspaceDto,
      );

      return await this.notificationWorkspaceRepository.findOne({
        where: { user_id: userId },
      });
    } catch (error) {
      handleError(error);
    }
  }
}
