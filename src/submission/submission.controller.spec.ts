import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';

const mockSubmissionService = {
  sendSubmission: jest.fn(),
};

describe('SubmissionsController', () => {
  let submissionController: SubmissionController;
  let submissionService: SubmissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [
        {
          provide: SubmissionService,
          useValue: mockSubmissionService,
        },
      ],
    }).compile();

    submissionController =
      module.get<SubmissionController>(SubmissionController);
    submissionService = module.get<SubmissionService>(SubmissionService);
  });

  it('should be defined', () => {
    expect(submissionController).toBeDefined();
  });

  describe('sendSubmission', () => {
    it('should call submissionService.sendSubmission', async () => {
      const dto = {
        studentId: 'test',
        studentName: 'test',
        componentType: 'Essay Whiting',
        submitText: 'test',
      };

      const student = {
        sub: 1,
        studentId: 'test',
        name: 'test',
      };

      const expectedResponse = {
        result: 'ok',
        message: null,
        studentId: student.studentId,
        studentName: student.name,
        score: 9,
        feedback: '아쉽지만...',
        highlights: ['test'],
        highlightSubmitText: '<b>test</b>',
        submitText: 'test',
        mediaUrl: { video: 'videoSasUrl', audio: 'audioSasUrl' },
        apiLatency: 2222,
      };

      // authService에서 반환하는 값
      mockSubmissionService.sendSubmission.mockResolvedValue(expectedResponse);

      const file = {
        originalname: 'file.mp3',
        path: '/path/to/file.mp3',
        mimetype: 'audio/mp3',
        buffer: Buffer.from('mock data'),
      } as Express.Multer.File;

      // 실제 controller에서 메서드 호출
      const result = await submissionController.sendSubmission(
        dto,
        student,
        file,
      );

      // authService.signUp이 실행됐나
      expect(submissionController.sendSubmission).toHaveBeenCalledWith(dto);

      // 반환 값과 맞냐
      expect(result).toEqual(expectedResponse);
    });
  });
});
