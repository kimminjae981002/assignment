import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { Repository } from 'typeorm';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
  ) {}

  // 과제 제출
  // 흐름: 학생이 과제를 제출한다.(제출할 때는, sId, sName, type, text, file이 필요하다.)
  //       제출을 하면 AI가 파일을 읽고 피드백을 해준다.
  //       submissions 디비에 저장되며, 비디오 파일이 이미지 제거, 동영상 음성 제거 및 음성 파일로 변환이 된다.
  //        변환된 파일은 submission_media에 저장이된다.
  async sendSubmission(createSubmissionDto: CreateSubmissionDto) {
    const {} = createSubmissionDto;
    //     const submission = this.submissionRepository.create(createSubmissionDto);
    //     return await this.submissionRepository.save(submission);
  }
}
