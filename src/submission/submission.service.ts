import { AzureService } from './../azure/azure.service';
import { VideoService } from './../video/video.service';
import { ConfigService } from '@nestjs/config';
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
import { AzureOpenAIService } from 'src/azure/azure-openai.service';
import { responseSubmission } from './interface/responseSubmissionInterface';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly videoService: VideoService,
    private readonly azureService: AzureService,
    private readonly azureOpenAIService: AzureOpenAIService,
  ) {}

  // 과제 제출
  // 흐름: 학생이 과제를 제출한다.(제출할 때는, sId, sName, type, text, file이 필요하다.)
  //       제출을 하면 AI가 파일을 읽고 피드백을 해준다.
  //       submissions 디비에 저장되며, 비디오 파일이 이미지 제거, 동영상 음성 제거 및 음성 파일로 변환이 된다.
  //        변환된 파일은 submission_media에 저장이된다.
  async sendSubmission(
    createSubmissionDto: CreateSubmissionDto,
    user: JwtPayloadInterface,
    videoFile: Express.Multer.File,
  ): Promise<responseSubmission> {
    const startTime = Date.now();
    const { studentName, studentId, componentType, submitText } =
      createSubmissionDto;

    let audioSasUrl = '';
    let videoSasUrl = '';

    // body값과 토큰 값 유저가 맞는지 확인하는 로직
    const findUser = await this.userCheck(user, studentName, studentId);

    const existComponentType = await this.submissionRepository.findOne({
      where: { studentId: findUser.userId, componentType },
    });

    if (existComponentType) {
      throw new BadRequestException(
        '똑같은 과제 형식으로 중복 제출은 불가능합니다.',
      );
    }

    if (!submitText) {
      throw new BadRequestException('평가 받을 과제를 제출해주세요.');
    }

    const prompt = `당신은 영어 문법 선생님입니다. 내용에 대하여 score, feedback, highlights를 작성해주세요. 내용: ${submitText} 답변은 한국어로 부탁드리고 답변 예시 형식에 꼭 맞춰주시고 JSON 형식으로 반환해주세요.
    답변 예시) score: 2 10점 만점 평가, feedback: 전반적으로 잘 작성했지만 부족한 부분을 말씀 드리겠습니다, highlights: ["test", "where"] 내용에 대해 감전한 부분을 배열로 넣기, highlightSubmitText: 내용에 highlights에 속한 게 있다면 내용에 <b>test</b> 이런 식으로 반환해줘 내용에 넣어서 `;

    // 영상 & 음성 추출
    // Azure에 비디오 & 오디오 추출 파일 저장
    if (videoFile) {
      const audio = await this.videoService.audio(videoFile, user.userId);
      const video = await this.videoService.videoInNoAudio(
        videoFile,
        user.userId,
      );

      // Azure SASURL 가져오기
      audioSasUrl = await this.azureService.uploadToAzureBlob(
        audio,
        user.userId,
        'audio',
      );

      videoSasUrl = await this.azureService.uploadToAzureBlob(
        video,
        user.userId,
        'video',
      );
    }

    // ai 답변 가져오기
    const aiAnswer = await this.azureOpenAIService.openAI(prompt);

    // submission DB에 저장
    const submission = this.submissionRepository.create({
      ...createSubmissionDto,
      videoFile: 'TEST',
      studentId: findUser.userId,
      score: aiAnswer.score,
      highlights: aiAnswer.highlights,
      feedback: aiAnswer.feedback,
      metadata: { test: 'test' },
      user: findUser,
    });

    await this.submissionRepository.save(submission);

    // API 호출 후 시간 기록
    const endTime = Date.now();

    // 응답 시간 측정
    const apiLatency = endTime - startTime;

    return {
      result: 'ok',
      message: null,
      studentId: findUser.userId,
      studentName: findUser.name,
      score: aiAnswer.score,
      feedback: aiAnswer.feedback,
      highlights: aiAnswer.highlights,
      highlightSubmitText: aiAnswer.highlightSubmitText,
      submitText,
      mediaUrl: { video: videoSasUrl, audio: audioSasUrl },
      apiLatency,
    };
  }

  // api 사용하는 유저와 body 유저가 맞는지 확인하는 로직
  async userCheck(user: any, studentName: string, studentId: string) {
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

    return findUser;
  }
}
