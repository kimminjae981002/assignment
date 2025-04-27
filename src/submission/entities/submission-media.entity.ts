import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Submission } from './submission.entity';

@Entity('submission_media')
export class SubmissionMedia extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  azure_mp3_url: string;

  @Column()
  azure_mp4_url: string;

  @Column({ type: 'jsonb' })
  metadata: object;

  // submission_id 컬럼을 명시적으로 추가하여 외래 키가 올바르게 생성되도록 함
  @Column({ name: 'submission_id', nullable: true })
  submissionId: number;

  // submission 엔티티와 매핑
  @OneToOne(() => Submission, (submission) => submission.submissionMedia)
  @JoinColumn({ name: 'submission_id' })
  submission: Submission; // 이 필드는 외래 키인 submission와 자동으로 연결됩니다.
}
