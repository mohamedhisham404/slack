import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class UserPreferences {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', nullable: true })
  time_zone: string;

  @Column({ type: 'enum', enum: ['light', 'dark'], default: 'light' })
  color_mode: string;

  @Column({ type: 'text', nullable: true })
  theme: string;

  @Column({ type: 'text', nullable: true })
  language: string;
}
