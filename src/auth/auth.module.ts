import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserPreferences } from 'src/user-preferences/entities/user-preference.entity';
import { UserWorkspace } from 'src/workspace/entities/user-workspace.entity';
import { Channels } from 'src/channels/entities/channel.entity';
import { UserChannel } from 'src/channels/entities/user-channel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserPreferences,
      UserWorkspace,
      Channels,
      UserChannel,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
