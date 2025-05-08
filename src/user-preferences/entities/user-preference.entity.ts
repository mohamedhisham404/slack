import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserColorMode } from '../enums/userColorMode.enum';
import { UserTheme } from '../enums/userTheme.enum';
import { UserLanguage } from '../enums/userLanguage.enum';

@Entity()
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @OneToOne(() => User, (user) => user.preferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
