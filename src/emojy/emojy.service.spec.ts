import { Test, TestingModule } from '@nestjs/testing';
import { EmojyService } from './emojy.service';

describe('EmojyService', () => {
  let service: EmojyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmojyService],
    }).compile();

    service = module.get<EmojyService>(EmojyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
