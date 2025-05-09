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
import { DataSource, Repository } from 'typeorm';
import { UserWorkspace } from './entities/user-workspace.entity';
import { Request } from 'express';
import { AddUserDTO } from './dto/add-user.dto';
import { handleError } from 'src/utils/errorHandling';
import { workspaceRole } from './enums/workspace-role.enum';
import { getUserFromRequest } from 'src/utils/get-user';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workSpaceRepo: Repository<Workspace>,

    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepo: Repository<UserWorkspace>,

    private readonly dataSource: DataSource,
  ) {}

  async checkWorkspace(workspaceId: string, userId: string) {
    const workspace = await this.workSpaceRepo.findOne({
      where: {
        id: workspaceId,
        userWorkspaces: {
          user: {
            id: userId,
          },
        },
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

    const isMember = workspace.userWorkspaces?.some(
      (uw) => uw.user.id === userId,
    );

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return workspace;
  }

  async create(createWorkspaceDto: CreateWorkspaceDto, req: Request) {
    try {
      const userReq = getUserFromRequest(req);
      const userId = userReq?.userId;

      const workspace = await this.dataSource.transaction(async (manager) => {
        const workspace = manager.create(Workspace, {
          name: createWorkspaceDto.name,
          userWorkspaces: [
            {
              user: { id: userId },
              role: workspaceRole.ADMIN,
            },
          ],
        });

        await manager.save(workspace);
        return workspace;
      });

      return {
        message: 'Workspace created successfully',
        workspaceId: workspace.id,
        workspaceName: createWorkspaceDto.name,
      };
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async addUser(addUser: AddUserDTO, req: Request) {
    try {
      const { workspaceId, userId, role } = addUser;

      const userReq = getUserFromRequest(req);
      const currentUserId = userReq?.userId;

      if (!workspaceId || !currentUserId) {
        throw new BadRequestException('Workspace ID and User ID are required');
      }

      const currentworkspace = await this.checkWorkspace(
        workspaceId,
        currentUserId,
      );

      if (
        role === workspaceRole.ADMIN &&
        currentworkspace.userWorkspaces[0].role !== workspaceRole.ADMIN
      ) {
        throw new BadRequestException(
          'You are not allowed to add someone as admin',
        );
      }

      const userExists = await this.userWorkspaceRepo.exist({
        where: {
          user: { id: userId },
          workspace: { id: workspaceId },
        },
      });

      if (userExists) {
        throw new ConflictException('User already exists in this workspace');
      }

      await this.userWorkspaceRepo.insert({
        user: { id: userId },
        workspace: { id: workspaceId },
        role: role,
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

      if (workspace.userWorkspaces[0].role !== workspaceRole.ADMIN) {
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

      if (!workspaceId || !currentUserId) {
        throw new BadRequestException('Workspace ID and User ID are required');
      }

      const workspace = await this.checkWorkspace(workspaceId, currentUserId);

      if (workspace.userWorkspaces[0].role !== workspaceRole.ADMIN) {
        throw new BadRequestException(
          'You are not allowed to remove user from workspace',
        );
      }

      if (userId === currentUserId) {
        throw new BadRequestException(
          'You cannot remove yourself from workspace',
        );
      }

      const result = await this.userWorkspaceRepo.delete({
        user: { id: userId },
        workspace: { id: workspaceId },
      });
      if (result.affected === 0) {
        throw new NotFoundException('User not found in this workspace');
      }
      return {
        message: 'User removed from workspace successfully',
        userId: userId,
        workspaceId: workspaceId,
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

      if (workspace.userWorkspaces[0].role !== workspaceRole.ADMIN) {
        throw new BadRequestException(
          'You are not allowed to remove a workspace',
        );
      }
      const result = await this.workSpaceRepo.delete({
        id: workspaceId,
      });
      if (result.affected === 0) {
        throw new NotFoundException('Workspace not found');
      }
      return {
        message: 'Workspace removed successfully',
        workspaceId: workspaceId,
      };
    } catch (error) {
      handleError(error);
    }
  }
}
