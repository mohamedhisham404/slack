import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from 'src/message/entities/message.entity';
import { WorkspaceUsers } from 'src/workspace-users/entities/workspace-user.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
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

  @OneToMany(() => WorkspaceUsers, (wu) => wu.user)
  workspaceUsers: WorkspaceUsers[];
}
