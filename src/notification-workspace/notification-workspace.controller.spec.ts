import { Test, TestingModule } from '@nestjs/testing';
import { NotificationWorkspaceController } from './notification-workspace.controller';
import { NotificationWorkspaceService } from './notification-workspace.service';

describe('NotificationWorkspaceController', () => {
  let controller: NotificationWorkspaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationWorkspaceController],
      providers: [NotificationWorkspaceService],
    }).compile();

    controller = module.get<NotificationWorkspaceController>(NotificationWorkspaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
