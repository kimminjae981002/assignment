import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { Repository } from 'typeorm';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtPayloadInterface } from 'src/auth/interface/jwt-payload.interface';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 과제 제출
  // 흐름: 학생이 과제를 제출한다.(제출할 때는, sId, sName, type, text, file이 필요하다.)
  //       제출을 하면 AI가 파일을 읽고 피드백을 해준다.
  //       submissions 디비에 저장되며, 비디오 파일이 이미지 제거, 동영상 음성 제거 및 음성 파일로 변환이 된다.
  //        변환된 파일은 submission_media에 저장이된다.
  async sendSubmission(
    createSubmissionDto: CreateSubmissionDto,
    user: JwtPayloadInterface,
  ) {
    const { studentName, studentId, componentType } = createSubmissionDto;

    // 가드: 유저 고유아이디를 이용해 유저를 찾는다.
    const findUser: User | null = await this.userRepository.findOne({
      where: { id: user.sub },
    });

    if (!findUser) {
      throw new NotFoundException('등록되지 않은 유저입니다.');
    }

    // body값과 가드 user 정보가 다르면 에러
    if (findUser.name !== studentName)
      throw new BadRequestException(
        '작성한 사용자 이름과 유저 이름이 다릅니다.',
      );

    if (findUser.userId !== studentId)
      throw new BadRequestException(
        '작성한 사용자 아이디와 유저 아이디가 다릅니다.',
      );

    const existComponentType = await this.submissionRepository.findOne({
      where: { id: findUser.id, componentType },
    });

    if (existComponentType) {
      throw new BadRequestException(
        '똑같은 과제 형식으로 중복 제출은 불가능합니다.',
      );
    }

    //     const submission = this.submissionRepository.create(createSubmissionDto);
    //     return await this.submissionRepository.save(submission);
  }
}
