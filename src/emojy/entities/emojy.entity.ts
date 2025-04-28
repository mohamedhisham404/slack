import { MessageReaction } from 'src/message/entities/message-reaction.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Workspace } from 'src/workspace/entities/workspace.entity';

@Entity()
export class Emojy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  unicode: string;

  @Column()
  name: string;

  @Column()
  workspace_id: number;

  @ManyToOne(() => Workspace, (workspace) => workspace.emojis, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @OneToMany(() => MessageReaction, (reaction) => reaction.emojy)
  reactions: MessageReaction[];
}
