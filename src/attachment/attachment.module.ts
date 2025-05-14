import { Module } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AttachmentController } from './attachment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './entities/attachment.entity';
import { ChannelsModule } from 'src/channels/channels.module';
import { Message } from 'src/message/entities/message.entity';
import { MinioClientModule } from 'src/minio-client/minio-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment, Message]),
    ChannelsModule,
    MinioClientModule,
  ],
  controllers: [AttachmentController],
  providers: [AttachmentService],
})
export class AttachmentModule {}
