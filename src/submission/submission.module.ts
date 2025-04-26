import { Module } from '@nestjs/common';
import { SubmissionsService } from './submission.service';
import { SubmissionsController } from './submission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Submission])],
  providers: [SubmissionsService],
  controllers: [SubmissionsController],
})
export class SubmissionsModule {}
