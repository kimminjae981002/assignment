import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
@Injectable()
export class VideoService {
  //  음성  추출
  async audio(file: any, studentId: string) {
    const { uniqueFileName, filePath, studentDir } = await this.uploadPath(
      file,
      studentId,
    );

    const outputAudioPath = path.join(
      studentDir,
      `${studentId}-${uniqueFileName}.mp3`,
    );

    // 음성 추출
    const audio: string = await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .noVideo()
        .audioCodec('libmp3lame')
        .output(outputAudioPath) // 이 경로에 저장한다.
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    return outputAudioPath;
  }

  // 왼쪽 이미지 제거 & 오디오 없는 비디오 추출
  async videoInNoAudio(file: any, studentId: string) {
    const { uniqueFileName, filePath, studentDir } = await this.uploadPath(
      file,
      studentId,
    );

    const outputVideoNoAudioPath = path.join(
      studentDir,
      `${studentId}-${uniqueFileName}.mp4`,
    );

    // 영상 왼쪽 이미지 제거 & 음성 제거
    const video: string = await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .noAudio() // 오디오 제거
        .videoFilter('crop=iw/2-10:ih:iw/2+100:0') // 왼쪽 이미지 제거
        .output(outputVideoNoAudioPath) // 이 경로에 저장한다.
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    return outputVideoNoAudioPath;
  }

  async uploadPath(file, studentId: string) {
    // 업로드된 파일 경로 (절대 경로로 변환)
    const filePath = path.resolve(file.path); // 업로드된 파일의 절대 경로
    const uniqueFileName = uuidv4();

    const studentDir = path.join(
      process.cwd(),
      'src',
      'uploads',
      studentId.toString(),
    );

    if (!fs.existsSync(studentDir)) {
      fs.mkdirSync(studentDir, { recursive: true }); // 상위 디렉토리까지 자동 생성
    }

    return {
      result: 'success',
      uniqueFileName,
      filePath,
      studentDir,
    };
  }
}
