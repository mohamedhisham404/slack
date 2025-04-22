import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';

@Entity()
export class WorkspaceUsers {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  workspace_id: number;

  @ManyToOne(() => User, (user) => user.workspaceUsers)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'enum', enum: ['admin', 'member'], default: 'member' })
  role: string;
}
