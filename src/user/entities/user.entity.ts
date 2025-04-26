import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column()
  age: number;

  @Column({ nullable: true, default: 0 })
  level: number;

  @Column()
  gender: string;

  @Column()
  birthDate: Date;

  @Column({ nullable: true })
  paymentDate: Date;
}
