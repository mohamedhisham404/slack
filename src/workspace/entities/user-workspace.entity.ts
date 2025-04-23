import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Workspace } from './workspace.entity';

@Entity('user_workspaces')
export class UserWorkspace {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userWorkspaces)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.userWorkspaces)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column({ default: 'member' })
  role: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
