import { BaseEntity } from 'src/common/entities/base.entity';
import { SubmissionLog } from 'src/logger/entities/submission-log.entity';

import { Submission } from 'src/submission/entities/submission.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('revisions')
export class Revision extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  revision_reason: string;

  @Column()
  isRevision: boolean;

  // submission 엔티티와 매핑
  @ManyToOne(() => Submission, (submission) => submission.revision)
  @JoinColumn({ name: 'submission_id' })
  submission: Submission; // 이 필드는 외래 키인 submission와 자동으로 연결됩니다.

  // submission media 엔티티와 매핑
  @OneToOne(() => SubmissionLog, (submissionLog) => submissionLog.revision)
  submissionLog: SubmissionLog; // 이 필드는 외래 키인 submission_media id와 자동으로 연결됩니다.
}
