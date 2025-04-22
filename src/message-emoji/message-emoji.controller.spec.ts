import { Test, TestingModule } from '@nestjs/testing';
import { MessageEmojiController } from './message-emoji.controller';
import { MessageEmojiService } from './message-emoji.service';

describe('MessageEmojiController', () => {
  let controller: MessageEmojiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageEmojiController],
      providers: [MessageEmojiService],
    }).compile();

    controller = module.get<MessageEmojiController>(MessageEmojiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
