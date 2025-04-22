import { Test, TestingModule } from '@nestjs/testing';
import { NotificationWorkspaceService } from './notification-workspace.service';

describe('NotificationWorkspaceService', () => {
  let service: NotificationWorkspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationWorkspaceService],
    }).compile();

    service = module.get<NotificationWorkspaceService>(NotificationWorkspaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
