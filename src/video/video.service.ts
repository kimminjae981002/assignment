import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class VideoService {
  //  음성  추출
  async audio(file: any, userId: string) {
    const uploadDir = path.resolve(process.cwd(), 'src', 'uploads');

    // 업로드된 파일 경로 (절대 경로로 변환)
    const filePath = path.resolve(file.path); // 업로드된 파일의 절대 경로

    // 저장할 파일 경로와 네임
    const uniqueFileName = uuidv4();
    const outputAudioPath = path.join(
      uploadDir,
      `${userId}-${uniqueFileName}.mp3`,
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

  // 오른쪽 이미지 제거 & 오디오 없는 비디오 추출
  async videoInNoAudio(file: any, userId: string) {
    const uploadDir = path.resolve(process.cwd(), 'src', 'uploads');

    // 업로드된 파일 경로 (절대 경로로 변환)
    const filePath = path.resolve(file.path); // 업로드된 파일의 절대 경로
    const uniqueFileName = uuidv4();

    const outputVideoNoAudioPath = path.join(
      uploadDir,
      `${userId}-${uniqueFileName}.mp4`,
    );

    // 영상 오른쪽 이미지 제거 & 음성 제거
    const video: string = await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .noAudio() // 오디오 제거
        .videoFilter('crop=iw/2:ih:0:0') // 오른쪽 이미지 제거
        .output(outputVideoNoAudioPath) // 이 경로에 저장한다.
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    return outputVideoNoAudioPath;
  }
}
