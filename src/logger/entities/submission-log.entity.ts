import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Revision } from 'src/revision/entities/revision.entity';
import { Submission } from 'src/submission/entities/submission.entity';

@Entity('submission_logs')
export class SubmissionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'trace_id' })
  traceId: string;

  @Column()
  latency: number;

  @Column()
  result: 'success' | 'failed';

  @Column({ name: 'api_end_point' })
  apiEndPoint: string;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  // submission 엔티티와 매핑
  @OneToOne(() => Submission, (submission) => submission.submissionLog)
  @JoinColumn({ name: 'submission_id' })
  submission: Submission; // 이 필드는 외래 키인 submission와 자동으로 연결됩니다.

  // revision 엔티티와 매핑
  @OneToOne(() => Revision, (revision) => revision.submissionLog, {
    nullable: true,
  })
  @JoinColumn({ name: 'revision_id' })
  revision: Revision; // 이 필드는 외래 키인 revision와 자동으로 연결됩니다.
}
