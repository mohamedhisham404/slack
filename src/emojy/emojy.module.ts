import { Module } from '@nestjs/common';
import { EmojyService } from './emojy.service';
import { EmojyController } from './emojy.controller';
import { Emojy } from './entities/emojy.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Emojy])],
  controllers: [EmojyController],
  providers: [EmojyService],
})
export class EmojyModule {}
