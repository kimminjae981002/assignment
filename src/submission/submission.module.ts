import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { User } from 'src/user/entities/user.entity';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { MulterModule } from '@nestjs/platform-express';
import { VideoModule } from 'src/video/video.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, User]),
    MulterModule.register({ dest: '/uploads' }),
    VideoModule,
  ],
  providers: [SubmissionService],
  controllers: [SubmissionController],
})
export class SubmissionModule {}
