import { Test, TestingModule } from '@nestjs/testing';
import { RevisionService } from './revision.service';
import { Repository } from 'typeorm';
import { Revision } from './entities/revision.entity';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Submission } from 'src/submission/entities/submission.entity';
import { AzureOpenAIService } from 'src/azure/azure-openai.service';
import { SubmissionLogService } from 'src/logger/submission-log.service';
import { DataSource } from 'typeorm';

// 실제 메서드를 작성해야한다.
// mock 함수 정의
const mockRevisionRepository = {
  save: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockSubmissionRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
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

describe('RevisionService', () => {
  let revisionService: RevisionService;
  let revisionRepository: Repository<Revision>;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevisionService,
        {
          provide: getRepositoryToken(Revision),
          useValue: mockRevisionRepository,
        },
        {
          provide: getRepositoryToken(Submission),
          useValue: mockSubmissionRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
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

    revisionService = module.get<RevisionService>(RevisionService);
  });

  it('should be defined', () => {
    expect(revisionService).toBeDefined();
  });

  // findRevision 검증 테스트
  describe('findRevision', () => {
    // revision 없음
    it('should return failed found revision', async () => {
      mockRevisionRepository.findOne.mockResolvedValueOnce(null);

      const result = await revisionService.findRevision(1);

      expect(result).toEqual({
        status: 204,
        result: 'failed',
        message: '재평가를 조회할 수 없습니다.',
      });

      expect(mockRevisionRepository.findOne).toHaveBeenCalledTimes(1);
    });

    // revision 상세조회
    it('should return revision', async () => {
      // 가상 객체
      const revision = {
        id: 1,
        revision_reason: 'test',
        isRevision: true,
      };

      // 가상 객체를 사용하여 반환한다.
      mockRevisionRepository.findOne.mockResolvedValueOnce(revision);

      // 실제 서비스 로직을 사용하여 mock 함수에서 반환한다.
      const result = await revisionService.findRevision(revision.id);

      // 실제 service 로직과 mock 로직 return 값이 같다.
      expect(result).toEqual(revision);

      // 한 번은 호출은 되었는지 확인한다.
      expect(mockRevisionRepository.findOne).toHaveBeenCalled();
    });
  });

  // findRevisions 검증 테스트
  describe('findRevisions', () => {
    // revisions 없음
    it('should return failed found revisions', async () => {
      mockRevisionRepository.find.mockResolvedValueOnce([]);

      const result = await revisionService.findRevisions(1, 10);

      expect(result).toEqual({
        status: 204,
        result: 'failed',
        message: '재평가를 조회할 수 없습니다.',
      });

      expect(mockRevisionRepository.find).toHaveBeenCalledTimes(1);
    });

    // revision 찾기
    it('should return revisions', async () => {
      // 가상 객체
      const revision = {
        id: 1,
        revision_reason: 'test',
        isRevision: true,
      };

      // 가상 객체를 사용하여 반환한다.
      mockRevisionRepository.find.mockResolvedValueOnce(revision);

      // 실제 서비스 로직을 사용하여 mock 함수에서 반환한다.
      const result = await revisionService.findRevisions(1, 10);

      // 실제 service 로직과 mock 로직 return 값이 같다.
      expect(result).toEqual(revision);

      // 한 번은 호출은 되었는지 확인한다.
      expect(mockRevisionRepository.find).toHaveBeenCalled();
    });
  });

  // 평가 제출 테스트
  it('should submit successfully and log the submission', async () => {
    const dto = {
      revision_reason: '다시 평가 받을래요',
      isRevision: true,
      submission_id: 1,
    };

    const mockSubmission = {
      id: 1,
      submitText: 'This is my essay.',
      student: { id: 1 },
    };

    const aiAnswer = {
      score: 9,
      feedback: '잘했어요!',
      highlights: ['test'],
    };

    const studentJwt = {
      sub: 1,
      name: 'test',
      studentId: 'test',
    };

    // Mock return values
    // 실제 로직은 건들지 않고 Mock을 이용해서 데이터 사용

    mockSubmissionRepository.findOne.mockResolvedValueOnce(mockSubmission);
    mockAzureOpenAIService.openAI.mockResolvedValueOnce(aiAnswer);
    mockDataSource.transaction.mockImplementationOnce(async (callback) =>
      callback({
        update: jest.fn(),
        create: jest.fn().mockReturnValue(dto),
        save: jest.fn(),
      }),
    );

    const mockSaveLog = jest.fn();
    mockSubmissionLogService.saveLog = mockSaveLog;

    const result = await revisionService.revisionSubmission(dto, studentJwt);

    // 내가 예상한 응답값이 맞는지 result와 서비스 로직 반환 값
    expect(result).toMatchObject({
      result: 'ok',
      message: '해당 평가에 대해 재평가 되었습니다.',
    });

    // 로그 호출 확인
    expect(mockSaveLog).toHaveBeenCalledTimes(1);
    expect(mockSaveLog).toHaveBeenCalledWith(
      expect.objectContaining({
        result: 'info',
        apiEndPoint: '/revision', // 실제 엔드포인트는 변경 가능
        latency: expect.any(Number),
        message: `${studentJwt.sub} 고유 아이디를 가진 학생이 재평가 제출 API를 호출했습니다.`,
        revision: dto,
      }),
    );
  });
});
