import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import * as fs from 'fs';
import * as path from 'path';

// uuid를 mock 함수를 사용하여 고정해준다.
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('42e916bc-5166-492f-b35c-4e08e8867226'), // 고정된 UUID 값 설정
}));

// jest.mock('fs');

describe('VideoService', () => {
  let videoService: VideoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoService],
    }).compile();

    videoService = module.get<VideoService>(VideoService);
  });

  it('should be defined', () => {
    expect(videoService).toBeDefined();
  });

  // uploadPath 검증 테스트
  describe('audio', () => {
    it('should return audio path', async () => {
      // 가짜 정보 담아주기
      const mockFile = { path: './uploads/test.mp3' };
      const studentId = 'test';

      const { uniqueFileName, filePath, studentDir } =
        await videoService.uploadPath(mockFile, studentId);

      const outputAudioPath = path.join(
        studentDir,
        `${studentId}-${uniqueFileName}.mp4`,
      );

      const result = await videoService.audio(mockFile, studentId);

      expect(result).toEqual({
        result: 'success',
        outputAudioPath,
      });
    });
  });

  // uploadPath 검증 테스트
  describe('videoInNoAudio', () => {
    it('should return video path', async () => {
      // 가짜 정보 담아주기
      const mockFile = { path: './uploads/test.mp3' };
      const studentId = 'test';

      const { uniqueFileName, filePath, studentDir } =
        await videoService.uploadPath(mockFile, studentId);

      const outputVideoNoAudioPath = path.join(
        studentDir,
        `${studentId}-${uniqueFileName}.mp4`,
      );

      const result = await videoService.videoInNoAudio(mockFile, studentId);

      expect(result).toEqual({
        result: 'success',
        outputVideoNoAudioPath,
      });
    });
  });

  // uploadPath 검증 테스트
  describe('uploadPath', () => {
    it('should return upload path', async () => {
      // 가짜 정보 담아주기
      const mockFile = { path: './uploads/test.mp3' };
      const studentId = 'test';

      const result = await videoService.uploadPath(mockFile, studentId);

      expect(result).toEqual({
        result: 'success',
        uniqueFileName: '42e916bc-5166-492f-b35c-4e08e8867226',
        filePath: path.resolve('./uploads/test.mp3'),
        studentDir: path.join(process.cwd(), 'src', 'uploads', studentId),
      });
    });
  });
});
