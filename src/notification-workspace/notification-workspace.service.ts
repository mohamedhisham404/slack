import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateNotificationWorkspaceDto } from './dto/update-notification-workspace.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationWorkspace } from './entities/notification-workspace.entity';
import { Repository } from 'typeorm';
import { handleError } from 'src/utils/errorHandling';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { getUserFromRequest } from 'src/utils/get-user';
import { Workspace } from 'src/workspace/entities/workspace.entity';

@Injectable()
export class NotificationWorkspaceService {
  constructor(
    @InjectRepository(NotificationWorkspace)
    private readonly notificationWorkspaceRepository: Repository<NotificationWorkspace>,

    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,

    private readonly workspaceService: WorkspaceService,
  ) {}

  async findOne(req: Request, workspaceId: string) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      const workspace = await this.workspaceRepository.findOne({
        where: {
          id: workspaceId,
        },
        relations: {
          userWorkspaces: {
            user: true,
          },
          notificationWorkspaces: true,
        },
        select: {
          id: true,
          userWorkspaces: {
            id: true,
            user: {
              id: true,
            },
          },
          notificationWorkspaces: true,
        },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const userWorkspace = workspace.userWorkspaces?.find(
        (uw) => uw.user.id === userId,
      );

      if (!userWorkspace) {
        throw new ForbiddenException('You are not a member of this workspace');
      }

      return workspace.notificationWorkspaces;
    } catch (error) {
      handleError(error);
    }
  }

  async update(
    req: Request,
    updateNotificationWorkspaceDto: UpdateNotificationWorkspaceDto,
    workspaceId: string,
  ) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      if (!userId) {
        throw new ForbiddenException('User not found');
      }

      await this.workspaceService.checkWorkspace(workspaceId, userId);

      const result = await this.notificationWorkspaceRepository
        .createQueryBuilder()
        .update()
        .set({
          ...updateNotificationWorkspaceDto,
        })
        .where('workspaceId = :workspaceId', { workspaceId })
        .andWhere('userId = :userId', { userId })
        .returning('*')
        .execute();

      const updatedNotificationWorkspace = (
        result.raw as NotificationWorkspace[]
      )[0];
      return updatedNotificationWorkspace;
    } catch (error) {
      handleError(error);
    }
  }
}
