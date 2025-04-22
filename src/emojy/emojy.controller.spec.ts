import { Test, TestingModule } from '@nestjs/testing';
import { EmojyController } from './emojy.controller';
import { EmojyService } from './emojy.service';

describe('EmojyController', () => {
  let controller: EmojyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmojyController],
      providers: [EmojyService],
    }).compile();

    controller = module.get<EmojyController>(EmojyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
