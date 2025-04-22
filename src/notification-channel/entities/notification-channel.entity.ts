import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Channels } from 'src/channels/entities/channel.entity';

@Entity()
export class NotificationChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  channel_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Channels)
  @JoinColumn({ name: 'channel_id' })
  channel: Channels;

  @Column({ default: false })
  VIP_notifications: boolean;

  @Column({ default: false })
  huddle_notifications: boolean;

  @Column({ type: 'timestamp', nullable: true })
  start_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time: Date;
}
