import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Channels } from 'src/channels/entities/channel.entity';

@Entity()
export class ChannelUsers {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  channel_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Channels)
  @JoinColumn({ name: 'channel_id' })
  channel: Channels;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'enum', enum: ['admin', 'member'], default: 'member' })
  role: string;
}
