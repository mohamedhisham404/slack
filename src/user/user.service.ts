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
import { UserChannel } from 'src/channels/entities/user-channel.entity';
import { ChannelsService } from 'src/channels/channels.service';
import { UserWorkspace } from 'src/workspace/entities/user-workspace.entity';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { handleError } from 'src/utils/errorHandling';
import { plainToInstance } from 'class-transformer';
import { UserPreferences } from 'src/user-preferences/entities/user-preference.entity';
import { NotificationWorkspace } from 'src/notification-workspace/entities/notification-workspace.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserChannel)
    private readonly userChannelRepository: Repository<UserChannel>,

    @InjectRepository(UserWorkspace)
    private readonly usersWorkspaceRepository: Repository<UserWorkspace>,

    @InjectRepository(UserPreferences)
    private readonly userPreferencesRepository: Repository<UserPreferences>,

    @InjectRepository(NotificationWorkspace)
    private readonly notificationWorkspaceRepository: Repository<NotificationWorkspace>,

    private readonly channelService: ChannelsService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async findAllUsersInChannel(channelId: number, req: Request) {
    try {
      const currentUserId = req.user.userId;

      await this.channelService.checkTheChannel(channelId, currentUserId);

      const WorkspaceUser = await this.usersWorkspaceRepository.findOne({
        where: { user: { id: currentUserId } },
      });
      if (!WorkspaceUser) {
        throw new BadRequestException('You are not in this workspace');
      }

      const users = await this.userChannelRepository.find({
        where: { channel: { id: channelId } },
        relations: ['user'],
        select: {
          id: true,
          role: true,
          joinedAt: true,
          user: {
            id: true,
            name: true,
            email: true,
            profile_photo: true,
            status: true,
            is_active: true,
          },
        },
      });
      if (!users) {
        throw new BadRequestException('No users found in this channel');
      }
      return users;
    } catch (error) {
      handleError(error);
    }
  }

  async findAllUsersInWorkspace(workspaceId: number, req: Request) {
    try {
      const currentUserId = req.user.userId;

      if (workspaceId === 1) {
        throw new BadRequestException('You cannot access this workspace');
      }

      await this.workspaceService.checkWorkspace(workspaceId, currentUserId);

      const WorkspaceUser = await this.usersWorkspaceRepository.findOne({
        where: { user: { id: currentUserId } },
      });
      if (!WorkspaceUser) {
        throw new BadRequestException('You are not in this workspace');
      }

      const users = await this.usersWorkspaceRepository.find({
        where: { workspace: { id: workspaceId } },
        relations: ['user'],
        select: {
          id: true,
          role: true,
          joinedAt: true,
          user: {
            id: true,
            name: true,
            email: true,
            profile_photo: true,
            status: true,
            is_active: true,
          },
        },
      });
      if (!users) {
        throw new NotFoundException('No users found in this workspace');
      }
      return users;
    } catch (error) {
      handleError(error);
    }
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userChannels', 'userWorkspaces'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return plainToInstance(User, user, { excludeExtraneousValues: false });
  }

  async update(id: number, updateUserDto: UpdateUserDto, req: Request) {
    try {
      const currentUserId = req.user.userId;
      const user = await this.userRepository.findOne({
        where: { id },
      });
      if (id !== currentUserId) {
        throw new BadRequestException('You cannot update other users');
      }

      const updatedUser = await this.userRepository.save({
        ...user,
        ...updateUserDto,
      });
      if (!updatedUser) {
        throw new BadRequestException('User not updated');
      }
      return plainToInstance(User, updatedUser, {
        excludeExtraneousValues: false,
      });
    } catch (error) {
      handleError(error);
    }
  }

  async remove(id: number, req: Request) {
    try {
      const currentUserId = req.user.userId;

      if (id !== currentUserId) {
        throw new BadRequestException('You cannot delete other users');
      }

      await this.usersWorkspaceRepository.delete({
        user: { id: currentUserId },
      });

      await this.userChannelRepository.delete({ user: { id: currentUserId } });

      await this.userPreferencesRepository.delete({
        user_id: currentUserId,
      });

      const user = await this.userRepository.findOne({
        where: { id: currentUserId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.notificationWorkspaceRepository.delete({
        user_id: currentUserId,
      });

      await this.userRepository.remove(user);
      return {
        message: 'User and related records deleted successfully',
      };
    } catch (error) {
      handleError(error);
    }
  }
}
