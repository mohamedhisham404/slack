import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
// import { UserChannel } from 'src/channels/entities/user-channel.entity';
// import { ChannelsService } from 'src/channels/channels.service';
// import { UserWorkspace } from 'src/workspace/entities/user-workspace.entity';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { handleError } from 'src/utils/errorHandling';
import { plainToInstance } from 'class-transformer';
import { getUserFromRequest } from 'src/utils/get-user';
// import { UserPreferences } from 'src/user-preferences/entities/user-preference.entity';
// import { NotificationWorkspace } from 'src/notification-workspace/entities/notification-workspace.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // @InjectRepository(UserChannel)
    // private readonly userChannelRepository: Repository<UserChannel>,
    // @InjectRepository(UserWorkspace)
    // private readonly usersWorkspaceRepository: Repository<UserWorkspace>,
    // @InjectRepository(UserPreferences)
    // private readonly userPreferencesRepository: Repository<UserPreferences>,
    // @InjectRepository(NotificationWorkspace)
    // private readonly notificationWorkspaceRepository: Repository<NotificationWorkspace>,
    // private readonly channelService: ChannelsService,
    private readonly workspaceService: WorkspaceService,
  ) {}
  // async findAllUsersInChannel(channelId: number, req: Request) {
  //   try {
  //     const currentUserId = req.user.userId;
  //     await this.channelService.checkTheChannel(channelId, currentUserId);
  //     const WorkspaceUser = await this.usersWorkspaceRepository.findOne({
  //       where: { user: { id: currentUserId } },
  //     });
  //     if (!WorkspaceUser) {
  //       throw new BadRequestException('You are not in this workspace');
  //     }
  //     const users = await this.userChannelRepository.find({
  //       where: { channel: { id: channelId } },
  //       relations: ['user'],
  //       select: {
  //         id: true,
  //         role: true,
  //         joinedAt: true,
  //         user: {
  //           id: true,
  //           name: true,
  //           email: true,
  //           profile_photo: true,
  //           status: true,
  //           is_active: true,
  //         },
  //       },
  //     });
  //     if (!users) {
  //       throw new BadRequestException('No users found in this channel');
  //     }
  //     return users;
  //   } catch (error) {
  //     handleError(error);
  //   }
  // }

  async findAllUsersInWorkspace(workspaceId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      if (!workspaceId || !currentUserId) {
        throw new BadRequestException('Workspace ID and User ID are required');
      }

      const currentworkspace = await this.workspaceService.checkWorkspace(
        workspaceId,
        currentUserId,
      );

      return currentworkspace.userWorkspaces;
    } catch (error) {
      handleError(error);
    }
  }

  async findOne(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return plainToInstance(User, user, { excludeExtraneousValues: false });
    } catch (error) {
      handleError(error);
    }
  }

  async update(updateUserDto: UpdateUserDto, req: Request) {
    try {
      const reqUser = getUserFromRequest(req);
      const currentUserId = reqUser?.userId;

      const result = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ ...updateUserDto })
        .where('id = :id', { id: currentUserId })
        .returning('*')
        .execute();

      const updatedUser = (result.raw as User[])[0];

      return plainToInstance(User, updatedUser, {
        excludeExtraneousValues: false,
      });
    } catch (error) {
      handleError(error);
    }
  }

  async remove(req: Request) {
    try {
      const reqUser = getUserFromRequest(req);
      const currentUserId = reqUser?.userId;

      if (!currentUserId) {
        throw new BadRequestException('User ID is missing');
      }

      await this.userRepository.delete(currentUserId);

      return {
        message: 'User and related records deleted successfully',
      };
    } catch (error) {
      handleError(error);
    }
  }
}
