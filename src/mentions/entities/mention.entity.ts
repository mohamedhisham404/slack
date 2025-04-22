import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Message } from 'src/message/entities/message.entity';

@Entity()
export class Mentions {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  message_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'message_id' })
  message: Message;
}
