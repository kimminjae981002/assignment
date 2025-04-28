import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { SubmissionLog } from './entities/submission-log.entity';
import { SubmissionLogService } from './submission-log.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubmissionLog]),
    WinstonModule.forRootAsync({
      useFactory: () => ({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple(),
            ),
          }),
        ],
      }),
    }),
  ],
  providers: [SubmissionLogService],
  exports: [SubmissionLogService],
})
export class LoggerModule {}
