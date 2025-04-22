import { Module } from '@nestjs/common';
import { EmojyService } from './emojy.service';
import { EmojyController } from './emojy.controller';

@Module({
  controllers: [EmojyController],
  providers: [EmojyService],
})
export class EmojyModule {}
