import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { UserWorkspace } from './entities/user-workspace.entity';
import { User } from 'src/user/entities/user.entity';
import { Attachment } from 'src/attachment/entities/attachment.entity';
import { MinioClientModule } from 'src/minio-client/minio-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, UserWorkspace, User, Attachment]),
    MinioClientModule,
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
