import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { User } from 'src/user/entities/user.entity';
import { UserChannel } from './user-channel.entity';

@Entity()
export class Channels {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  workspace_id: number;

  @ManyToOne(() => Workspace, (workspace) => workspace.channels, {
    onDelete: 'CASCADE',
  })
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

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @OneToMany(() => UserChannel, (userChannel) => userChannel.channel)
  userChannels: UserChannel[];
}
