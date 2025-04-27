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
import { DataSource, Repository } from 'typeorm';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { JwtPayloadInterface } from 'src/auth/interface/jwt-payload.interface';
import { AzureOpenAIService } from 'src/azure/azure-openai.service';
import { responseSubmission } from './interface/responseSubmissionInterface';
import { SubmissionMedia } from './entities/submission-media.entity';
import { FindSubmissionsDto } from './dto/find-submission.dto';
import { Student } from 'src/student/entities/student.entity';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(SubmissionMedia)
    private readonly submissionMediaRepository: Repository<SubmissionMedia>,
    private readonly configService: ConfigService,
    private readonly videoService: VideoService,
    private readonly azureService: AzureService,
    private readonly azureOpenAIService: AzureOpenAIService,
    private readonly dataSource: DataSource,
  ) {}

  // 과제 제출
  // 흐름: 학생이 과제를 제출한다.(제출할 때는, sId, sName, type, text, file이 필요하다.)
  //       제출을 하면 AI가 파일을 읽고 피드백을 해준다.
  //       submissions 디비에 저장되며, 비디오 파일이 이미지 제거, 동영상 음성 제거 및 음성 파일로 변환이 된다.
  //        변환된 파일은 submission_media에 저장이된다.
  async sendSubmission(
    createSubmissionDto: CreateSubmissionDto,
    student: JwtPayloadInterface,
    videoFile: Express.Multer.File,
  ): Promise<responseSubmission> {
    const startTime = Date.now();
    const { studentName, studentId, componentType, submitText } =
      createSubmissionDto;

    let audioSasUrl = '';
    let videoSasUrl = '';
    let isVideoFile: boolean = videoFile ? true : false;

    // body값과 토큰 값 유저가 맞는지 확인하는 로직
    const findStudent = await this.studentCheck(
      student,
      studentName,
      studentId,
    );

    const existComponentType = await this.submissionRepository.findOne({
      where: {
        student: {
          id: findStudent.id, // 여기서 student 테이블의 studentId를 비교
        },
        componentType,
      },
      relations: ['student'],
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
    답변 예시) score: 2 10점 만점 평가, feedback: 전반적으로 잘 작성했지만 부족한 부분을 말씀 드리겠습니다, highlights: ["test", "where"] 내용에 대해 감전한 부분을 배열로 넣기`;

    // 영상 & 음성 추출
    // Azure에 비디오 & 오디오 추출 파일 저장
    if (isVideoFile) {
      const audio = await this.videoService.audio(videoFile, student.studentId);
      const video = await this.videoService.videoInNoAudio(
        videoFile,
        student.studentId,
      );

      // Azure SASURL 가져오기
      audioSasUrl = await this.azureService.uploadToAzureBlob(
        audio,
        student.studentId,
        'audio',
      );

      videoSasUrl = await this.azureService.uploadToAzureBlob(
        video,
        student.studentId,
        'video',
      );
    }

    // ai 답변 가져오기
    const aiAnswer = await this.azureOpenAIService.openAI(prompt);

    const highlightSubmitText = await this.highlightSubmitText(
      submitText,
      aiAnswer.highlights,
    );

    // 트랜잭션을 사용하여 데이터 저장 무결성 확보
    await this.dataSource.transaction(async (manager) => {
      // submission DB에 저장
      const submission = manager.create(Submission, {
        ...createSubmissionDto,
        videoFile: videoFile ? videoFile.originalname : 'null',
        submitText,
        status: 'complete',
        score: aiAnswer.score,
        highlights: aiAnswer.highlights,
        feedback: aiAnswer.feedback,
        metadata: videoFile
          ? { videoFile: videoFile.originalname, path: videoFile.path }
          : { videoFile: null, path: null },
        student: findStudent,
      });

      // 평가 데이터 저장
      await manager.save(Submission, submission);

      // 평가 중 file 변환 된 것 저장 - 파일이 있을 시에
      if (isVideoFile) {
        const submissionMedia = manager.create(SubmissionMedia, {
          azure_mp3_url: audioSasUrl,
          azure_mp4_url: videoSasUrl,
          metadata: {
            audioSasUrl: '오디오만 추출한 URL입니다.',
            videoSasUrl:
              '오른쪽 이미지를 제거한 동영상 파일입니다.(음성이 없습니다.)',
          },
          submission,
        });

        await manager.save(SubmissionMedia, submissionMedia);
      }
    });

    // API 호출 후 시간 기록
    const endTime = Date.now();

    // 응답 시간 측정
    const apiLatency = endTime - startTime;

    return {
      result: 'ok',
      message: null,
      studentId: findStudent.studentId,
      studentName: findStudent.name,
      score: aiAnswer.score,
      feedback: aiAnswer.feedback,
      highlights: aiAnswer.highlights,
      highlightSubmitText,
      submitText,
      mediaUrl: { video: videoSasUrl, audio: audioSasUrl },
      apiLatency,
    };
  }

  // api 사용하는 유저와 body 유저가 맞는지 확인하는 로직
  async studentCheck(student: any, studentName: string, studentId: string) {
    // 가드: 유저 고유아이디를 이용해 유저를 찾는다.
    const findStudent: Student | null = await this.studentRepository.findOne({
      where: { id: student.sub },
    });

    if (!findStudent) {
      throw new NotFoundException('등록되지 않은 유저입니다.');
    }

    // body값과 가드 Student 정보가 다르면 에러
    if (findStudent.name !== studentName)
      throw new BadRequestException(
        '작성한 사용자 이름과 유저 이름이 다릅니다.',
      );

    if (findStudent.studentId !== studentId)
      throw new BadRequestException(
        '작성한 사용자 아이디와 유저 아이디가 다릅니다.',
      );

    return findStudent;
  }

  // 감점 된 부분 정규식을 이용하여 강조 태그
  async highlightSubmitText(submitText: string, highlights: string[]) {
    highlights.forEach((word) => {
      // 감점 부분 단어 꺼내오기
      // 특수문자를 문자로 찾아온다.
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // submitText에서 검색하여 그 값에 강조 태그 넣어준다.
      const regex = new RegExp(escaped, 'gi');
      submitText = submitText.replace(regex, (match) => `<b>${match}</b>`);
    });
    return submitText;
  }

  // 학생 제출 결과 전체 조회
  async findSubmissions(
    page: number,
    size: number,
    findSubmissionsDto: FindSubmissionsDto,
  ) {
    const { status, studentId, studentName } = findSubmissionsDto;
    // 조건을 동적으로 설정
    const whereConditions: any = {};

    // 각 파라미터가 존재하면 해당 조건을 추가
    if (status) {
      whereConditions.status = status;
    }

    if (studentId) {
      whereConditions.student = { studentId: studentId };
    }

    if (studentName) {
      whereConditions.student = { name: studentName }; // name 추가
    }

    // size만큼 가져오기 , page를 계산해서 추출한다.
    const submissions = await this.submissionRepository.find({
      take: size || 20,
      skip: (page - 1) * size, // 페이지네이션을 위한 skip 계산
      where: whereConditions, // 동적으로 생성된 where 조건 적용
      order: {
        createdAt: 'DESC',
      },
      relations: ['student'],
    });

    if (submissions.length === 0) {
      return {
        result: submissions || [],
        message: '평가를 조회할 수 없습니다.',
      };
    }

    return submissions;
  }

  // 평가 상세 조회
  async findSubmission(submissionId: number) {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      return {
        result: false,
        message: '평가를 조회할 수 없습니다.',
      };
    }
    return submission;
  }
}
