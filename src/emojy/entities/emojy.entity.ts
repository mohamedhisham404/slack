import { MessageReaction } from 'src/message/entities/message-reaction.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Emojy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  unicode: string;

  @Column()
  name: string;

  @OneToMany(() => MessageReaction, (reaction) => reaction.emojy)
  reactions: MessageReaction[];
}
