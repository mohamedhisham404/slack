import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from 'src/message/entities/message.entity';
import { Emojy } from 'src/emojy/entities/emojy.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class MessageEmoji {
  @PrimaryColumn()
  message_id: number;

  @PrimaryColumn()
  emoji_id: number;

  @PrimaryColumn()
  user_id: number;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => Emojy)
  @JoinColumn({ name: 'emoji_id' })
  emoji: Emojy;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
