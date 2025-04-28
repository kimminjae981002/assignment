import * as TransportStream from 'winston-transport';
import { Injectable } from '@nestjs/common';
import { SubmissionLog } from './entities/submission-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 커스텀 DB 트랜스포트
@Injectable()
export class DBTransport extends TransportStream {
  constructor(
    @InjectRepository(SubmissionLog)
    private readonly submissionLogRepository: Repository<SubmissionLog>,
  ) {
    super();
  }

  async log(info: any, callback: () => void): Promise<void> {
    // winston에서 처리하는 로그 정보
    const {
      result,
      apiEndPoint,
      traceId,
      latency,
      message,
      revision,
      submission,
    } = info;

    try {
      // winston에서 받아서 db에 저장
      const logEntry = this.submissionLogRepository.create({
        result,
        apiEndPoint,
        traceId,
        latency,
        message,
        submission,
        revision,
      });

      await this.submissionLogRepository.save(logEntry);
    } catch (error) {
      console.error('DB Logging Error:', error);
    }

    callback();
  }
}
