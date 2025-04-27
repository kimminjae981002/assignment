import { Module } from '@nestjs/common';
import { RevisionService } from './revision.service';
import { RevisionController } from './revision.controller';
import { Revision } from './entities/revision.entity';
import { Submission } from 'src/submission/entities/submission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, Revision])],
  providers: [RevisionService],
  controllers: [RevisionController],
})
export class RevisionModule {}
