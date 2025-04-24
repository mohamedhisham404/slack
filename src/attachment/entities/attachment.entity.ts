import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from 'src/message/entities/message.entity';

export type AttachmentType = 'image' | 'video' | 'file' | 'link';
@Entity()
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message_id: number;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: ['image', 'video', 'file', 'link'] })
  type: AttachmentType;

  @Column('float')
  size: number;

  @Column()
  url: string;
}
