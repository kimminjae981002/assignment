import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { MulterModule } from '@nestjs/platform-express';
import { VideoModule } from 'src/video/video.module';
import { AzureModule } from 'src/azure/azure.module';
import { SubmissionMedia } from './entities/submission-media.entity';
import { Student } from 'src/student/entities/student.entity';
import { SubmissionLog } from 'src/logger/entities/submission-log.entity';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Submission,
      Student,
      SubmissionMedia,
      SubmissionLog,
    ]),
    MulterModule.register({ dest: '/uploads' }),
    VideoModule,
    AzureModule,
    LoggerModule,
  ],
  providers: [SubmissionService],
  controllers: [SubmissionController],
})
export class SubmissionModule {}
