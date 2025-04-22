import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Channels {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  workspace_id: number;

  @ManyToOne(() => Workspace, (workspace) => workspace.channels)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column()
  name: string;

  @Column({ nullable: true })
  topic: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ default: false })
  is_private: boolean;

  @Column({ default: false })
  is_dm: boolean;

  @CreateDateColumn()
  created_at: Date;
}
