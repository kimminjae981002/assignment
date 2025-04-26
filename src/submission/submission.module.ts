import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { User } from 'src/user/entities/user.entity';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, User])],
  providers: [SubmissionService],
  controllers: [SubmissionController],
})
export class SubmissionModule {}
