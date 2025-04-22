import { Module } from '@nestjs/common';
import { ChannelUsersService } from './channel-users.service';
import { ChannelUsersController } from './channel-users.controller';

@Module({
  controllers: [ChannelUsersController],
  providers: [ChannelUsersService],
})
export class ChannelUsersModule {}
