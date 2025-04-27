import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

export enum UserLanguage {
  ENGLISH = 'en',
  ARABIC = 'ar',
}

export enum UserTheme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum UserColorMode {
  DEFAULT = 'default',
  COLORFUL = 'colorful',
  RED = 'red',
  BLUE = 'blue',
}

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

  @Column({
    type: 'enum',
    enum: UserColorMode,
    default: UserColorMode.DEFAULT,
  })
  color_mode: UserColorMode;

  @Column({
    type: 'enum',
    enum: UserTheme,
    default: UserTheme.LIGHT,
  })
  theme: UserTheme;

  @Column({
    type: 'enum',
    enum: UserLanguage,
    default: UserLanguage.ENGLISH,
  })
  language: UserLanguage;
}
