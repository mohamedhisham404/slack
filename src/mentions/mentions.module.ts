import { Module } from '@nestjs/common';
import { MentionsService } from './mentions.service';
import { MentionsController } from './mentions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mentions } from './entities/mention.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mentions])],
  controllers: [MentionsController],
  providers: [MentionsService],
})
export class MentionsModule {}
