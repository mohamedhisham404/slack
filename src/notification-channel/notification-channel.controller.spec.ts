import { Test, TestingModule } from '@nestjs/testing';
import { NotificationChannelController } from './notification-channel.controller';
import { NotificationChannelService } from './notification-channel.service';

describe('NotificationChannelController', () => {
  let controller: NotificationChannelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationChannelController],
      providers: [NotificationChannelService],
    }).compile();

    controller = module.get<NotificationChannelController>(NotificationChannelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
