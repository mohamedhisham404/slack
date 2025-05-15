import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from 'src/message/entities/message.entity';
import { AttachmentType } from '../types/attachment.type';

@Entity()
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Message, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: ['image', 'video', 'file', 'audio'] })
  type: AttachmentType;

  @Column('float')
  size: number;

  @Column()
  url: string;
}
