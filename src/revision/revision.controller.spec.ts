import { Test, TestingModule } from '@nestjs/testing';
import { RevisionController } from './revision.controller';
import { RevisionService } from './revision.service';

const mockRevisionService = {
  revisionSubmission: jest.fn(),
};

describe('RevisionController', () => {
  let revisionController: RevisionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RevisionController],
      providers: [
        {
          provide: RevisionService,
          useValue: mockRevisionService,
        },
      ],
    }).compile();

    revisionController = module.get<RevisionController>(RevisionController);
  });

  it('should be defined', () => {
    expect(revisionController).toBeDefined();
  });

  // 재평가 제출 시 테스트
  describe('revisionSubmission', () => {
    it('should call revisionService.revisionSubmission', async () => {
      const revisionDto = {
        id: 1,
        revision_reason: 'test',
        isRevision: true,
        submission_id: 1,
      };

      const studentJwt = {
        sub: 1,
        studentId: 'test',
        name: 'test',
      };

      // 예상 응답값
      const expectedResponse = {
        result: 'ok',
        message: '해당 평가에 대해 재평가 되었습니다.',
      };

      // authService에서 반환하는 값
      mockRevisionService.revisionSubmission.mockResolvedValue(
        expectedResponse,
      );

      // 실제 controller에서 메서드 호출
      const result = await revisionController.revisionSubmission(
        revisionDto,
        studentJwt,
      );

      // mock 함수가 실행이 됐나
      expect(mockRevisionService.revisionSubmission).toHaveBeenCalledWith(
        revisionDto,
        studentJwt,
      );

      // 반환 값과 예상한 값이 맞냐
      expect(result).toEqual(expectedResponse);
    });
  });
});
