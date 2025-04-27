import { Module } from '@nestjs/common';
import { RevisionService } from './revision.service';
import { RevisionController } from './revision.controller';
import { Revision } from './entities/revision.entity';
import { Submission } from 'src/submission/entities/submission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzureModule } from 'src/azure/azure.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, Revision, User]),
    AzureModule,
  ],
  providers: [RevisionService],
  controllers: [RevisionController],
})
export class RevisionModule {}
