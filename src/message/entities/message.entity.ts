import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Channels } from 'src/channels/entities/channel.entity';
import { User } from 'src/user/entities/user.entity';

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

  @Column({ default: false })
  is_updated: boolean;

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
}
