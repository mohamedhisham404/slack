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
import { handleError } from 'src/utils/errorHandling';
import { plainToInstance } from 'class-transformer';
import { getUserFromRequest } from 'src/utils/get-user';
import { UserWorkspace } from 'src/workspace/entities/user-workspace.entity';
import { UserChannel } from 'src/channels/entities/user-channel.entity';
import { MinioClientService } from 'src/minio-client/minio-client.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserChannel)
    private readonly userChannelRepository: Repository<UserChannel>,

    @InjectRepository(UserWorkspace)
    private readonly usersWorkspaceRepository: Repository<UserWorkspace>,

    private minioClientService: MinioClientService,
  ) {}
  async findAllUsersInChannel(channelId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      const channel = await this.userChannelRepository.find({
        where: {
          channel: {
            id: channelId,
          },
        },
        relations: {
          user: true,
        },
        select: {
          id: true,
          role: true,
          joinedAt: true,
          user: {
            id: true,
            email: true,
            name: true,
          },
          channel: {
            id: true,
            name: true,
          },
        },
      });

      if (!channel || channel.length === 0) {
        throw new NotFoundException('Channel not found');
      }

      const isMember = channel.some(
        (userChannel) => userChannel.user.id === currentUserId,
      );

      if (!isMember) {
        throw new NotFoundException('You are not a member of this channel');
      }

      return channel;
    } catch (error) {
      handleError(error);
    }
  }

  async findAllUsersInWorkspace(workspaceId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      const workspace = await this.usersWorkspaceRepository.find({
        where: {
          workspace: {
            id: workspaceId,
          },
        },
        relations: {
          user: true,
        },
        select: {
          id: true,
          role: true,
          joinedAt: true,
          user: {
            id: true,
            email: true,
            name: true,
          },
          workspace: {
            id: true,
            name: true,
          },
        },
      });

      if (!workspace || workspace.length === 0) {
        throw new NotFoundException('Workspace not found');
      }

      const isMember = workspace.some(
        (userWorkspace) => userWorkspace.user.id === currentUserId,
      );

      if (!isMember) {
        throw new NotFoundException('You are not a member of this workspace');
      }

      return workspace;
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

  async update(
    profilePic: Express.Multer.File | undefined,
    updateUserDto: UpdateUserDto,
    req: Request,
  ) {
    try {
      const reqUser = getUserFromRequest(req);
      const currentUserId = reqUser?.userId;

      let profilePhotoUrl: string | undefined;

      if (profilePic) {
        const user = await this.userRepository.findOne({
          where: { id: currentUserId },
          select: { profile_photo: true },
        });

        if (user?.profile_photo) {
          const objectName = user.profile_photo.split('/').pop();

          if (!objectName) {
            throw new BadRequestException('Invalid profile photo URL');
          }

          await this.minioClientService.delete(objectName, 'profile-pictures');
        }

        const uploadedFile = await this.minioClientService.upload(
          profilePic.buffer,
          profilePic.originalname,
          profilePic.mimetype,
          'profile-pictures',
        );
        profilePhotoUrl = uploadedFile.url;
      }

      const updatePayload: Partial<User> = {
        ...updateUserDto,
      };

      if (profilePhotoUrl) {
        updatePayload.profile_photo = profilePhotoUrl;
      }

      const result = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set(updatePayload)
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
