import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Emojy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  unicode: string;

  @Column()
  name: string;
}
