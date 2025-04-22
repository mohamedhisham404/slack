import { Module } from '@nestjs/common';
import { WorkspaceUsersService } from './workspace-users.service';
import { WorkspaceUsersController } from './workspace-users.controller';
import { WorkspaceUsers } from './entities/workspace-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceUsers])],
  controllers: [WorkspaceUsersController],
  providers: [WorkspaceUsersService],
})
export class WorkspaceUsersModule {}
