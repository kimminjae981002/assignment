import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionService } from './submission.service';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { VideoService } from 'src/video/video.service';
import { AzureService } from 'src/azure/azure.service';
import { AzureOpenAIService } from 'src/azure/azure-openai.service';
import { SubmissionLogService } from 'src/logger/submission-log.service';
import { DataSource } from 'typeorm';
import { FindSubmissionsDto } from './dto/find-submission.dto';

const mockConfigService = {
  get: jest.fn(),
};

const mockSubmissionRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockStudentRepository = {
  findOne: jest.fn(),
};

const mockVideoService = {
  audio: jest.fn(),
  videoInNoAudio: jest.fn(),
};

const mockAzureService = {
  uploadToAzureBlob: jest.fn(),
};

const mockAzureOpenAIService = {
  openAI: jest.fn(),
};

const mockSubmissionLogService = {
  saveLog: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(),
};

describe('SubmissionsService', () => {
  let submissionRepository: Repository<Submission>;
  let submissionService: SubmissionService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(Submission),
          useValue: mockSubmissionRepository,
        },
        {
          provide: getRepositoryToken(Student),
          useValue: mockStudentRepository,
        },
        {
          provide: VideoService,
          useValue: mockVideoService,
        },
        {
          provide: AzureService,
          useValue: mockAzureService,
        },
        {
          provide: AzureOpenAIService,
          useValue: mockAzureOpenAIService,
        },
        {
          provide: SubmissionLogService,
          useValue: mockSubmissionLogService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();
    submissionRepository = module.get<Repository<Submission>>(
      getRepositoryToken(Submission),
    );
    submissionService = module.get<SubmissionService>(SubmissionService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(submissionService).toBeDefined();
  });

  // findSubmission 검증 테스트
  describe('findSubmission', () => {
    // submission 없음
    it('should return failed found submission', async () => {
      mockSubmissionRepository.findOne.mockResolvedValueOnce(null);

      const result = await submissionService.findSubmission(999);

      expect(result).toEqual({
        result: 'failed',
        message: '평가가 존재하지 않습니다.',
      });

      expect(mockSubmissionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });

      expect(mockSubmissionRepository.findOne).toHaveBeenCalledTimes(1);
    });

    // submission 반환해야한다.
    it('should return one submission', async () => {
      mockSubmissionRepository.findOne.mockClear();
      // 가상 객체
      const submission = {
        id: 1,
        videoFile: 'test',
        status: 'complete',
        submitText: 'test',
        score: 5,
        componentType: 'Speaking',
        feedback: 'test',
        highlights: ['test'],
        metadata: { test: 'test' },
      };

      // 가상 객체를 사용하여 반환한다.
      mockSubmissionRepository.findOne.mockResolvedValueOnce(submission);

      // 실제 서비스 로직을 사용하여 mock 함수에서 반환한다.
      const result = await submissionService.findSubmission(submission.id);

      // 실제 service 로직과 mock 로직 return 값이 같다.
      expect(result).toEqual(submission);

      // 한 번은 호출은 되었는지 확인한다.
      expect(mockSubmissionRepository.findOne).toHaveBeenCalled();
      expect(mockSubmissionRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  // findSubmissions 검증 테스트
  describe('findSubmissions', () => {
    // submissions 없음
    it('should return submissions is zero', async () => {
      const findSubmissionsDto = {
        studentId: 'test',
        studentName: 'test',
        status: 'complete',
      };

      const dto = { ...findSubmissionsDto };

      mockSubmissionRepository.find.mockResolvedValueOnce([]);

      const result = await submissionService.findSubmissions(1, 0, dto);

      expect(result).toEqual({
        result: 'failed',
        message: '평가를 조회할 수 없습니다.',
      });

      expect(mockSubmissionRepository.find).toHaveBeenCalledTimes(1);
    });

    // submissions 반환해야한다.
    it('should return submissions if found', async () => {
      const submissions = [
        {
          id: 1,
          videoFile: 'test',
          status: 'complete',
          submitText: 'test',
          score: 5,
          componentType: 'Speaking',
          feedback: 'test',
          highlights: ['test'],
          metadata: { test: 'test' },
        },
        {
          id: 2,
          videoFile: 'test',
          status: 'complete',
          submitText: 'test',
          score: 5,
          componentType: 'Speaking',
          feedback: 'test',
          highlights: ['test'],
          metadata: { test: 'test' },
        },
      ];

      const findSubmissionsDto = {}; // 조건 없는 경우

      const dto = { ...findSubmissionsDto };

      mockSubmissionRepository.find.mockResolvedValueOnce(submissions);

      const result = await submissionService.findSubmissions(1, 10, dto);

      expect(result).toEqual(submissions);
      expect(mockSubmissionRepository.find).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        where: {},
        order: {
          createdAt: 'DESC',
        },
      });
    });
  });

  // 평가 제출 테스트
  it('should submit successfully and log the submission', async () => {
    const studentJwt = { sub: 1, name: 'test', studentId: 'test' };
    const studentEntity = { id: 1, name: 'test', studentId: 'test' };

    const dto = {
      studentName: 'test',
      studentId: 'test',
      componentType: 'Essay Whiting',
      submitText: 'test',
    };

    const videoFile = {
      originalname: 'video.mp4',
      path: '/video.mp4',
    } as Express.Multer.File;

    const aiAnswer = {
      score: 9,
      feedback: '잘했어요!',
      highlights: ['test'],
    };

    const createdSubmission = { id: 999 };

    // Mock return values
    // 실제 로직은 건들지 않고 Mock을 이용해서 데이터 사용
    mockStudentRepository.findOne.mockResolvedValueOnce(studentEntity);
    mockSubmissionRepository.findOne.mockResolvedValueOnce(null);
    mockVideoService.audio.mockResolvedValueOnce('audioFile');
    mockVideoService.videoInNoAudio.mockResolvedValueOnce('videoNoAudioFile');
    mockAzureService.uploadToAzureBlob
      .mockResolvedValueOnce({ message: 'audio-url' })
      .mockResolvedValueOnce({ message: 'video-url' });
    mockAzureOpenAIService.openAI.mockResolvedValueOnce(aiAnswer);

    mockDataSource.transaction.mockImplementationOnce(async (callback) =>
      callback({
        create: jest.fn().mockReturnValue(createdSubmission),
        save: jest.fn(),
      }),
    );

    const mockSaveLog = jest.fn();
    mockSubmissionLogService.saveLog = mockSaveLog;

    const result = await submissionService.sendSubmission(
      dto,
      studentJwt,
      videoFile,
    );

    // 내가 예상한 응답값이 맞는지 result와 서비스 로직 반환 값
    expect(result).toMatchObject({
      result: 'ok',
      studentId: 'test',
      studentName: 'test',
      score: 9,
      feedback: '잘했어요!',
      highlights: ['test'],
      submitText: 'test',
      mediaUrl: {
        video: 'video-url',
        audio: 'audio-url',
      },
    });

    // 로그 호출 확인
    expect(mockSaveLog).toHaveBeenCalledTimes(1);
    expect(mockSaveLog).toHaveBeenCalledWith(
      expect.objectContaining({
        result: 'info',
        apiEndPoint: '/submissions',
        latency: expect.any(Number),
        message: expect.stringContaining(
          '고유 아이디를 가진 학생이 평가 제출 API를 호출했습니다.',
        ),
        submission: createdSubmission,
      }),
    );
  });
});
