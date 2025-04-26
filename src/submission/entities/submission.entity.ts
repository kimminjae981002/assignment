import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('submissions')
export class Submission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  file_url: string;

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
}
