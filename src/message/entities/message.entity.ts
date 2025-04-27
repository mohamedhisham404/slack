import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Channels } from 'src/channels/entities/channel.entity';
import { User } from 'src/user/entities/user.entity';
import { MessageReaction } from './message-reaction.entity';
import { Attachment } from 'src/attachment/entities/attachment.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  content: string;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  channel_id: number;

  @ManyToOne(() => Channels)
  @JoinColumn({ name: 'channel_id' })
  channel: Channels;

  @Column({ default: 0 })
  reply_count: number;

  @Column({ nullable: true })
  parent_message: number;

  @Column({ default: false })
  is_pinned: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @OneToMany(() => MessageReaction, (reaction) => reaction.message)
  reactions: MessageReaction[];

  @OneToMany(() => Attachment, (attachment) => attachment.message, {
    cascade: true,
  })
  attachments?: Attachment[];
}
