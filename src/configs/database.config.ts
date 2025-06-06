import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { SubmissionLog } from 'src/logger/entities/submission-log.entity';
import { Revision } from 'src/revision/entities/revision.entity';
import { Student } from 'src/student/entities/student.entity';
import { SubmissionMedia } from 'src/submission/entities/submission-media.entity';
import { Submission } from 'src/submission/entities/submission.entity';

export const typeOrmModuleAsyncOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    synchronize: configService.get<boolean>('DB_SYNC'),
    autoLoadEntities: true,
    entities: [Student, Submission, SubmissionMedia, Revision, SubmissionLog],
    logging: false,
  }),
};
