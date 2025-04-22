import { Module } from '@nestjs/common';
import { ChannelUsersService } from './channel-users.service';
import { ChannelUsersController } from './channel-users.controller';
import { ChannelUsers } from './entities/channel-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelUsers])],
  controllers: [ChannelUsersController],
  providers: [ChannelUsersService],
})
export class ChannelUsersModule {}
