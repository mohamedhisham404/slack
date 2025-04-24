import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from 'src/message/entities/message.entity';
import { UserChannel } from 'src/channels/entities/user-channel.entity';
import { UserWorkspace } from 'src/workspace/entities/user-workspace.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  phone: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profile_photo: string;

  @Column({ nullable: true })
  status: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  about_me: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: false })
  is_premium: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @OneToMany(() => UserChannel, (userChannel) => userChannel.user)
  userChannels: UserChannel[];

  @OneToMany(() => UserWorkspace, (userWorkspace) => userWorkspace.user)
  userWorkspaces: UserWorkspace[];
}
