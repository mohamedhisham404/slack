import { Test, TestingModule } from '@nestjs/testing';
import { NotificationChannelService } from './notification-channel.service';

describe('NotificationChannelService', () => {
  let service: NotificationChannelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationChannelService],
    }).compile();

    service = module.get<NotificationChannelService>(NotificationChannelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
