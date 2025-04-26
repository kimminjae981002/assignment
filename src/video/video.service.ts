import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class VideoService {
  // 동영상 파일 이미지 제거 & 영상 음성 제거 /  음성  추출
  // Azure Blob에 저장
  async processVideo(file: any, userId: string) {
    const uploadDir = path.resolve(process.cwd(), 'src', 'uploads');

    // 업로드된 파일 경로 (절대 경로로 변환)
    const filePath = path.resolve(file.path); // 업로드된 파일의 절대 경로

    // 저장할 파일 경로와 네임
    const outputAudioPath = path.join(uploadDir, 'audio.mp3');
    const outputVideoNoAudioPath = path.join(uploadDir, 'video_no_audio.mp4');

    // 음성 추출
    await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .noVideo()
        .audioCodec('libmp3lame')
        .output(outputAudioPath) // 이 경로에 저장한다.
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // 영상 오른쪽 이미지 제거 & 음성 제거
    await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .noAudio() // 오디오 제거
        .videoFilter('crop=iw/2:ih:0:0') // 오른쪽 이미지 제거
        .output(outputVideoNoAudioPath) // 이 경로에 저장한다.
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // // 예시: audio.mp3 업로드
    // const audio = await this.uploadToAzureBlob(
    //   outputAudioPath,
    //   userId,
    //   'audio',
    // );

    // // 예시: video_no_audio.mp4 업로드
    // const video = await this.uploadToAzureBlob(
    //   outputVideoNoAudioPath,
    //   userId,
    //   'video',
    // );

    // return {
    //   video,
    //   audio,
    // };
  }
}
