import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { DataSource, In, Repository } from 'typeorm';
import { UserWorkspace } from './entities/user-workspace.entity';
import { Request } from 'express';
import { AddUserDto } from './dto/add-user.dto';
import { handleError } from 'src/utils/errorHandling';
import { workspaceRole } from './enums/workspace-role.enum';
import { getUserFromRequest } from 'src/utils/get-user';
import { ChannelRole } from 'src/channels/enums/channel-role.enum';
import { UserChannel } from 'src/channels/entities/user-channel.entity';
import { Channels } from 'src/channels/entities/channel.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workSpaceRepo: Repository<Workspace>,

    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepo: Repository<UserWorkspace>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  async checkWorkspace(workspaceId: string, userId: string) {
    const workspace = await this.workSpaceRepo.findOne({
      where: {
        id: workspaceId,
      },
      relations: {
        userWorkspaces: {
          user: true,
        },
      },
      select: {
        id: true,
        name: true,
        created_at: true,
        updated_at: true,
        userWorkspaces: {
          id: true,
          role: true,
          user: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const userWorkspace = workspace.userWorkspaces?.find(
      (uw) => uw.user.id === userId,
    );

    if (!userWorkspace) {
      throw new ForbiddenException('user not a member of this workspace');
    }

    return {
      id: workspace.id,
      name: workspace.name,
      created_at: workspace.created_at,
      updated_at: workspace.updated_at,
      userWorkspace: {
        id: userWorkspace.id,
        role: userWorkspace.role,
        user: {
          id: userWorkspace.user.id,
          email: userWorkspace.user.email,
          name: userWorkspace.user.name,
        },
      },
    };
  }

  async create(createWorkspaceDto: CreateWorkspaceDto, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      const workspace = await this.dataSource.transaction(async (manager) => {
        const workspace = manager.create(Workspace, {
          name: createWorkspaceDto.name,
          created_by: { id: userId },
          userWorkspaces: [
            {
              user: { id: userId },
              role: workspaceRole.ADMIN,
            },
          ],
          channels: [
            {
              name: 'general',
              description: 'General channel',
              is_private: false,
              is_general: true,
              created_by: { id: userId },
              userChannels: [
                {
                  user: { id: userId },
                  role: ChannelRole.ADMIN,
                },
              ],
            },
          ],
        });

        await manager.save(workspace);
        return workspace;
      });

      return {
        message: 'Workspace created successfully',
        workspaceId: workspace.id,
        workspaceName: workspace.name,
      };
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async addUser(addUser: AddUserDto, req: Request) {
    try {
      const { workspaceId, userId, role } = addUser;

      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      if (currentUserId === userId) {
        throw new BadRequestException(
          'You cannot add yourself to the workspace',
        );
      }

      if (!workspaceId || !currentUserId) {
        throw new BadRequestException('Workspace ID and User ID are required');
      }

      const currentworkspace = await this.checkWorkspace(
        workspaceId,
        currentUserId,
      );

      const userExists = await this.userRepo.findOne({
        where: {
          id: userId,
        },
        relations: {
          userWorkspaces: true,
        },
      });

      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      const userInWorkspace = userExists.userWorkspaces.find(
        (uw) => uw.workspace.id === workspaceId,
      );
      if (userInWorkspace) {
        throw new ConflictException('User already exists in this workspace');
      }

      if (
        role === workspaceRole.ADMIN &&
        currentworkspace.userWorkspace.role !== workspaceRole.ADMIN
      ) {
        throw new BadRequestException(
          'You are not allowed to add someone as admin',
        );
      }

      await this.dataSource.transaction(async (manager) => {
        const [, generalChannel] = await Promise.all([
          manager.insert(UserWorkspace, {
            user: { id: userId },
            workspace: { id: workspaceId },
            role: role,
          }),
          manager.findOne(Channels, {
            where: {
              name: 'general',
              workspace: { id: workspaceId },
            },
            select: ['id'],
          }),
        ]);

        if (!generalChannel) {
          throw new NotFoundException(
            'General channel not found in the workspace',
          );
        }

        await manager.insert(UserChannel, {
          user: { id: userId },
          channel: { id: generalChannel.id },
          role: ChannelRole.MEMBER,
        });
      });

      return {
        message: 'User added to workspace successfully',
        userId: userId,
        workspaceId: workspaceId,
      };
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async findOne(workspaceId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      if (!workspaceId || !userId) {
        throw new BadRequestException('Workspace ID and User ID are required');
      }

      const workspace = await this.checkWorkspace(workspaceId, userId);

      return {
        workspace,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async getAllUsersWorkspaces(req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      const Workspaces = await this.userWorkspaceRepo.find({
        where: {
          user: { id: userId },
        },
        relations: {
          workspace: true,
        },
      });

      return Workspaces;
    } catch (error) {
      handleError(error);
    }
  }

  async update(
    workspaceId: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
    req: Request,
  ) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      if (!workspaceId || !userId) {
        throw new BadRequestException('Workspace ID and User ID are required');
      }

      const workspace = await this.checkWorkspace(workspaceId, userId);

      if (workspace.userWorkspace.role !== workspaceRole.ADMIN) {
        throw new BadRequestException(
          'You are not allowed to update this workspace',
        );
      }

      const result = await this.workSpaceRepo
        .createQueryBuilder()
        .update(Workspace)
        .set({
          name: updateWorkspaceDto.name,
        })
        .where('id = :id', { id: workspaceId })
        .returning('*')
        .execute();

      const updatedWorkspace = (result.raw as Workspace[])[0];

      return updatedWorkspace;
    } catch (error) {
      handleError(error);
    }
  }

  async removeUser(workspaceId: string, userId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      if (userId === currentUserId) {
        throw new BadRequestException(
          'You cannot remove yourself from workspace',
        );
      }

      const workspace = await this.workSpaceRepo.findOne({
        where: {
          id: workspaceId,
        },
        relations: {
          userWorkspaces: {
            user: true,
          },
          channels: true,
        },
        select: {
          userWorkspaces: {
            user: { id: true },
            role: true,
          },
          channels: {
            id: true,
          },
        },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const existingUser = workspace.userWorkspaces.find(
        (user) => user.user.id === currentUserId,
      );
      if (!existingUser) {
        throw new NotFoundException('You are not a member of this workspace');
      }

      if (existingUser.role !== workspaceRole.ADMIN) {
        throw new BadRequestException(
          'You are not allowed to remove a user from this workspace',
        );
      }

      await this.dataSource.transaction(async (manager) => {
        const channelIds = workspace.channels.map((c) => c.id);

        if (channelIds.length > 0) {
          await manager.delete(UserChannel, {
            user: { id: userId },
            channel: { id: In(channelIds) },
          });
        }

        const result = await manager.delete(UserWorkspace, {
          user: { id: userId },
          workspace: { id: workspaceId },
        });

        if (result.affected === 0) {
          throw new NotFoundException('User not found in this workspace');
        }
      });

      return {
        message: 'User removed from workspace successfully',
        userId,
        workspaceId,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async remove(workspaceId: string, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      if (!workspaceId || !currentUserId) {
        throw new BadRequestException('Workspace ID and User ID are required');
      }

      const workspace = await this.checkWorkspace(workspaceId, currentUserId);

      if (workspace.userWorkspace.role !== workspaceRole.ADMIN) {
        throw new BadRequestException(
          'You are not allowed to remove a workspace',
        );
      }

      await this.workSpaceRepo.delete({
        id: workspaceId,
      });

      return {
        message: 'Workspace removed successfully',
        workspaceId: workspaceId,
      };
    } catch (error) {
      handleError(error);
    }
  }
}
