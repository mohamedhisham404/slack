import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserPreferences } from 'src/user-preferences/entities/user-preference.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  phone: string;

  @Exclude()
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: false })
  is_premium: boolean;

  @OneToOne(() => UserPreferences, (prefs) => prefs.user, { cascade: true })
  preferences: UserPreferences;
}
