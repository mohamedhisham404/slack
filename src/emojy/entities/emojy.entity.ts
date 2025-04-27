import { MessageReaction } from 'src/message/entities/message-reaction.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Channels } from 'src/channels/entities/channel.entity';

@Entity()
export class Emojy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  unicode: string;

  @Column()
  name: string;

  @Column()
  channel_id: number;

  @ManyToOne(() => Channels, (channel) => channel.emojis, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'channel_id' })
  channel: Channels;

  @OneToMany(() => MessageReaction, (reaction) => reaction.emojy)
  reactions: MessageReaction[];
}
