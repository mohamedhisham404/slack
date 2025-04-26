import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from 'src/message/entities/message.entity';

export type AttachmentType = 'image' | 'video' | 'file' | 'audio';
@Entity()
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message_id: number;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
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
