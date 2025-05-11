import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { UserWorkspace } from './user-workspace.entity';
import { Channels } from 'src/channels/entities/channel.entity';
import { User } from 'src/user/entities/user.entity';
import { NotificationWorkspace } from 'src/notification-workspace/entities/notification-workspace.entity';

@Entity()
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => UserWorkspace, (userWorkspace) => userWorkspace.workspace, {
    cascade: true,
  })
  userWorkspaces: UserWorkspace[];

  @OneToMany(() => Channels, (channel) => channel.workspace, { cascade: true })
  channels: Channels[];

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @OneToMany(
    () => NotificationWorkspace,
    (notificationWorkspace) => notificationWorkspace.workspace,
    { onDelete: 'CASCADE' },
  )
  notificationWorkspaces: NotificationWorkspace[];
}
