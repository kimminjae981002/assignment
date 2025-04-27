import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SubmissionMedia } from './submission-media.entity';
import { Revision } from 'src/revision/entities/revision.entity';

@Entity('submissions')
export class Submission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'video_file', nullable: true })
  videoFile: string;

  @Column({ default: 'waiting' })
  status: string;

  @Column({ name: 'submit_text' })
  submitText: string;

  @Column()
  score: number;

  @Column({ name: 'component_type' })
  componentType: string;

  @Column()
  feedback: string;

  @Column({ nullable: true })
  highlights: string;

  @Column({ type: 'jsonb' })
  metadata: object;

  // ManyToOne 관계를 통해 User 엔티티와 매핑
  @ManyToOne(() => User, (user) => user.submissions)
  @JoinColumn({ name: 'user_id' })
  user: User; // 이 필드는 외래 키인 userId와 자동으로 연결됩니다.

  // submission media 엔티티와 매핑
  @OneToOne(
    () => SubmissionMedia,
    (submissionMedia) => submissionMedia.submission,
  )
  submissionMedia: SubmissionMedia; // 이 필드는 외래 키인 submission_media id와 자동으로 연결됩니다.

  // revision 엔티티와 매핑
  @OneToOne(() => Revision, (revision) => revision.submission)
  revision: Revision; // 이 필드는 외래 키인 revision id와 자동으로 연결됩니다.
}
