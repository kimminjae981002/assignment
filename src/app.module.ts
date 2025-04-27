import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { typeOrmModuleAsyncOptions } from './configs/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionModule } from './submission/submission.module';
import { VideoService } from './video/video.service';
import { VideoModule } from './video/video.module';
import { AzureModule } from './azure/azure.module';
import { RevisionModule } from './revision/revision.module';
import { StudentModule } from './student/student.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleAsyncOptions),
    WinstonModule.forRoot({
      level: 'debug',
      transports: [
        new winston.transports.Console({
          // console에 나오도록 할 것이다. color를 넣고, timestamp 등 내가 원하는 형식
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.timestamp(),
            winston.format.printf(
              (info) =>
                `${info.timestamp} [${info.context}] ${info.level} ${info.message}`,
            ),
          ),
        }),
      ],
    }), // debug 이상 모두 로깅하겠다.
    AuthModule,
    StudentModule,
    SubmissionModule,
    VideoModule,
    AzureModule,
    RevisionModule,
  ],
  controllers: [AppController],
  providers: [AppService, VideoService],
})
export class AppModule {}
