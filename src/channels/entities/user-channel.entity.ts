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

export enum ChannelRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('user_channels')
export class UserChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userChannels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Channels, (channel) => channel.userChannels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'channel_id' })
  channel: Channels;

  @Column({ type: 'enum', enum: ChannelRole, default: ChannelRole.MEMBER })
  role: ChannelRole;

  @CreateDateColumn({
    name: 'joined_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joinedAt: Date;
}
