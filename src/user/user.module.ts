import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserChannel } from 'src/channels/entities/user-channel.entity';
import { UserWorkspace } from 'src/workspace/entities/user-workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserChannel, UserWorkspace])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
