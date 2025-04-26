import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('submissions')
export class Submission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column()
  status: string;

  @Column()
  score: number;

  @Column({ unique: true })
  feedback: string;

  @Column({ nullable: true })
  highlights: string;

  @Column({ type: 'jsonb' })
  metadata: object;

  // ManyToOne 관계를 통해 User 엔티티와 매핑
  @ManyToOne(() => User, (user) => user.submissions)
  user: User; // 이 필드는 외래 키인 userId와 자동으로 연결됩니다.
}
