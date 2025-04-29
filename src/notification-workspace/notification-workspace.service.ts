import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateNotificationWorkspaceDto } from './dto/update-notification-workspace.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationWorkspace } from './entities/notification-workspace.entity';
import { Repository } from 'typeorm';
import { handleError } from 'src/utils/errorHandling';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class NotificationWorkspaceService {
  constructor(
    @InjectRepository(NotificationWorkspace)
    private readonly notificationWorkspaceRepository: Repository<NotificationWorkspace>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly workspaceService: WorkspaceService,
  ) {}

  async findOne(req: Request, workspaceId: number) {
    try {
      const userId = req.user.userId;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.workspaceService.checkWorkspace(workspaceId, userId);

      const notificationWorkspace =
        await this.notificationWorkspaceRepository.findOne({
          where: { user_id: userId, workspace_id: workspaceId },
        });

      return notificationWorkspace;
    } catch (error) {
      handleError(error);
    }
  }

  async update(
    req: Request,
    updateNotificationWorkspaceDto: UpdateNotificationWorkspaceDto,
    workspaceId: number,
  ) {
    try {
      const userId = req.user.userId;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.workspaceService.checkWorkspace(workspaceId, userId);

      const notificationWorkspace =
        await this.notificationWorkspaceRepository.findOne({
          where: { user_id: userId, workspace_id: workspaceId },
        });

      const updatedNotificationWorkspace =
        await this.notificationWorkspaceRepository.save({
          ...notificationWorkspace,
          ...updateNotificationWorkspaceDto,
        });
      return updatedNotificationWorkspace;
    } catch (error) {
      handleError(error);
    }
  }
}
