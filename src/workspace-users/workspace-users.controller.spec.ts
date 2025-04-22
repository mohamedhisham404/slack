import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceUsersController } from './workspace-users.controller';
import { WorkspaceUsersService } from './workspace-users.service';

describe('WorkspaceUsersController', () => {
  let controller: WorkspaceUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceUsersController],
      providers: [WorkspaceUsersService],
    }).compile();

    controller = module.get<WorkspaceUsersController>(WorkspaceUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
