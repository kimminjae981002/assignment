import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SubmissionLog } from './entities/submission-log.entity';
import * as winston from 'winston';
import { DBTransport } from './db-transport';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubmissionLogService {
  constructor(
    @InjectRepository(SubmissionLog)
    private readonly submissionLogRepository: Repository<SubmissionLog>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {
    // winston 로거 초기화
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${process.pid} [${level}] ${message}`;
        }),
      ),
      transports: [
        new winston.transports.Console(),
        new DBTransport(this.submissionLogRepository),
      ],
    });
  }

  // winston 로그를 db-transport에 보내준다.
  async saveLog(info: any): Promise<any> {
    // 로그 작성

    const traceId = uuidv4();

    this.logger.info('info', {
      result: info.result, // 로그 항목에 대한 예시
      apiEndPoint: info.apiEndPoint,
      traceId: traceId,
      latency: info.latency,
      message: info.message,
      submission: info.submission,
      revision: info.revision,
    });

    return { success: true };
  }
}
