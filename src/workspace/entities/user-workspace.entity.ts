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

export enum workspaceRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('user_workspaces')
export class UserWorkspace {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userWorkspaces)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.userWorkspaces, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column({ type: 'enum', enum: workspaceRole, default: workspaceRole.MEMBER })
  role: workspaceRole;

  @CreateDateColumn({
    name: 'joined_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joinedAt: Date;
}
