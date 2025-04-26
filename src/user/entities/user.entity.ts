import { BaseEntity } from 'src/common/entities/base.entity';
import { Submission } from 'src/submission/entities/submission.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'user_id' })
  userId: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column({ nullable: true, default: 0 })
  level: number;

  @Column()
  gender: string;

  @Column({ name: 'birth_date' })
  birthDate: Date;

  @Column({ name: 'payment_date', nullable: true })
  paymentDate: Date;

  // OneToMany 관계를 통해 Submission 엔티티와 연결
  @OneToMany(() => Submission, (submission) => submission.user)
  submissions: Submission[]; // 이 부분은 User가 여러 개의 Submission을 가질 수 있음을 의미
}
