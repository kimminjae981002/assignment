import { SubmissionLogService } from './../logger/submission-log.service';
import { AzureService } from './../azure/azure.service';
import { VideoService } from './../video/video.service';
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
    private readonly videoService: VideoService,
    private readonly azureService: AzureService,
    private readonly azureOpenAIService: AzureOpenAIService,
    private readonly dataSource: DataSource,
    private readonly submissionLogService: SubmissionLogService,
  ) {}

  // 과제 제출
  async sendSubmission(
    createSubmissionDto: CreateSubmissionDto,
    student: JwtPayloadInterface,
    videoFile: Express.Multer.File,
  ): Promise<responseSubmission> {
    const startTime = Date.now();

    const { studentName, studentId, componentType, submitText } =
      createSubmissionDto;

    let isVideoFile: boolean = videoFile ? true : false;

    // body값과 토큰 값 유저가 맞는지 확인하는 로직
    const findStudent = await this.studentCheck(
      student,
      studentName,
      studentId,
    );

    if (!submitText) {
      throw new BadRequestException('평가 받을 과제를 제출해주세요.');
    }

    await this.checkComponentType(findStudent, componentType);

    // 영상 & 음성 추출
    const { audioSasUrl, videoSasUrl } = await this.processFiles(
      videoFile,
      findStudent.studentId,
    );

    // ai answer 가져오기
    const aiAnswer = await this.getAiAnswer(submitText);

    // 감점 부분 강조 태그
    const highlightSubmitText = await this.highlightSubmitText(
      submitText,
      aiAnswer.highlights,
    );

    // db 작업 트랜잭션 로직
    const submission = await this.createTransaction(
      createSubmissionDto,
      videoFile,
      submitText,
      aiAnswer,
      findStudent,
      isVideoFile,
      audioSasUrl,
      videoSasUrl,
    );

    // API 호출 후 시간 기록
    const endTime = Date.now();

    // 응답 시간 측정
    const apiLatency = endTime - startTime;

    // createSubmission 호출 (로그 기록)
    await this.submissionLogService.saveLog({
      result: 'info',
      apiEndPoint: '/submissions', // 실제 엔드포인트는 변경 가능
      latency: apiLatency,
      message: `${student.sub} 고유 아이디를 가진 학생이 평가 제출 API를 호출했습니다.`,
      submission: submission,
    });

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
      mediaUrl: {
        video:
          '보안 상 제거했습니다. https://storage.blob.../container/암호화/preview',
        audio:
          '보안 상 제거했습니다. https://storage.blob.../container/암호화/preview',
      },
      apiLatency,
    };
  }

  // 디비 작업 트랜잭션
  async createTransaction(
    createSubmissionDto: CreateSubmissionDto,
    videoFile,
    submitText: string,
    aiAnswer,
    findStudent: Student,
    isVideoFile: boolean,
    audioSasUrl: string,
    videoSasUrl: string,
  ) {
    // 트랜잭션을 사용하여 데이터 저장 무결성 확보
    return await this.dataSource.transaction(async (manager) => {
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

      return submission;
    });
  }

  // ai 답변 가져오기
  async getAiAnswer(submitText: string) {
    const prompt = `당신은 영어 문법 선생님입니다. 내용에 대하여 score, feedback, highlights를 작성해주세요. 내용: ${submitText} 답변은 한국어로 부탁드리고 답변 예시 형식에 꼭 맞춰주시고 JSON 형식으로 반환해주세요.
    답변 예시) score: 2 10점 만점 평가, feedback: 전반적으로 잘 작성했지만 부족한 부분을 말씀 드리겠습니다, highlights: ["test", "where"] 내용에 대해 감전한 부분을 배열로 넣기`;

    // ai 답변 가져오기
    const aiAnswer = await this.azureOpenAIService.openAI(prompt);

    return aiAnswer;
  }

  // 비디오 변환 로직 및 sasUrl 가져오기
  async processFiles(
    videoFile: Express.Multer.File,
    studentId: string,
  ): Promise<{ audioSasUrl: string; videoSasUrl: string }> {
    if (!videoFile) return { audioSasUrl: '', videoSasUrl: '' };

    // 비디오 변환 오디오 추출
    const audio = await this.videoService.audio(videoFile, studentId);
    const video = await this.videoService.videoInNoAudio(videoFile, studentId);

    // azure sas url
    const audioSasUrlResponse = await this.azureService.uploadToAzureBlob(
      audio,
      studentId,
      'audio',
    );
    const videoSasUrlResponse = await this.azureService.uploadToAzureBlob(
      video,
      studentId,
      'video',
    );

    const audioSasUrl = audioSasUrlResponse.message;
    const videoSasUrl = videoSasUrlResponse.message;

    return { audioSasUrl, videoSasUrl };
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

  // componentType 체크
  async checkComponentType(findStudent: Student, componentType: string) {
    // component type 중복 체크
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
    });

    if (submissions.length === 0) {
      return {
        result: 'failed',
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
        result: 'failed',
        message: '평가가 존재하지 않습니다.',
      };
    }
    return submission;
  }
}
