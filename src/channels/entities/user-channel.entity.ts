import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Channels } from './channel.entity';

@Entity('user_channels')
export class UserChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userChannels)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Channels, (channel) => channel.userChannels)
  @JoinColumn({ name: 'channel_id' })
  channel: Channels;

  @Column({ default: 'member' })
  role: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
