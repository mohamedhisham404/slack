import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Message } from './message.entity';
import { Emojy } from 'src/emojy/entities/emojy.entity';

@Entity('message_reactions')
export class MessageReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Message, (message) => message.reactions)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => Emojy)
  @JoinColumn({ name: 'emojy_id' })
  emojy: Emojy;

  @CreateDateColumn({ name: 'reacted_at' })
  reactedAt: Date;
}
