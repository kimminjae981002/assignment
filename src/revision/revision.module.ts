import { Module } from '@nestjs/common';
import { RevisionService } from './revision.service';
import { RevisionController } from './revision.controller';
import { Revision } from './entities/revision.entity';
import { Submission } from 'src/submission/entities/submission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzureModule } from 'src/azure/azure.module';
import { Student } from 'src/student/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, Revision, Student]),
    AzureModule,
  ],
  providers: [RevisionService],
  controllers: [RevisionController],
})
export class RevisionModule {}
