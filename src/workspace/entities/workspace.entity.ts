import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Channels } from 'src/channels/entities/channel.entity';
import { UserWorkspace } from './user-workspace.entity';
import { Emojy } from 'src/emojy/entities/emojy.entity';

@Entity()
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => Channels, (channel) => channel.workspace)
  channels: Channels[];

  @OneToMany(() => UserWorkspace, (userWorkspace) => userWorkspace.workspace)
  userWorkspaces: UserWorkspace[];

  @OneToMany(() => Emojy, (emojy) => emojy.workspace)
  emojis: Emojy[];
}
