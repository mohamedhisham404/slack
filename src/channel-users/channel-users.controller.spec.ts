import { Test, TestingModule } from '@nestjs/testing';
import { ChannelUsersController } from './channel-users.controller';
import { ChannelUsersService } from './channel-users.service';

describe('ChannelUsersController', () => {
  let controller: ChannelUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelUsersController],
      providers: [ChannelUsersService],
    }).compile();

    controller = module.get<ChannelUsersController>(ChannelUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
