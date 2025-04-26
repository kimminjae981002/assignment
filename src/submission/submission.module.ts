import { Module } from '@nestjs/common';
import { SubmissionsService } from './submission.service';
import { SubmissionsController } from './submission.controller';

@Module({
  providers: [SubmissionsService],
  controllers: [SubmissionsController],
})
export class SubmissionsModule {}
