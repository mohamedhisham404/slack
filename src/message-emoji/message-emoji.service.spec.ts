import { Test, TestingModule } from '@nestjs/testing';
import { MessageEmojiService } from './message-emoji.service';

describe('MessageEmojiService', () => {
  let service: MessageEmojiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageEmojiService],
    }).compile();

    service = module.get<MessageEmojiService>(MessageEmojiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
