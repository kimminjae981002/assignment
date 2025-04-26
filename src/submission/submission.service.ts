import { ConfigService } from '@nestjs/config';
import * as ffmpeg from 'fluent-ffmpeg';
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { Repository } from 'typeorm';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtPayloadInterface } from 'src/auth/interface/jwt-payload.interface';
import {
  StorageSharedKeyCredential,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from '@azure/storage-blob';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  // 과제 제출
  // 흐름: 학생이 과제를 제출한다.(제출할 때는, sId, sName, type, text, file이 필요하다.)
  //       제출을 하면 AI가 파일을 읽고 피드백을 해준다.
  //       submissions 디비에 저장되며, 비디오 파일이 이미지 제거, 동영상 음성 제거 및 음성 파일로 변환이 된다.
  //        변환된 파일은 submission_media에 저장이된다.
  async sendSubmission(
    createSubmissionDto: CreateSubmissionDto,
    user: JwtPayloadInterface,
    file: Express.Multer.File,
  ) {
    const { studentName, studentId, componentType, submitText } =
      createSubmissionDto;

    // 가드: 유저 고유아이디를 이용해 유저를 찾는다.
    const findUser: User | null = await this.userRepository.findOne({
      where: { id: user.sub },
    });

    if (!findUser) {
      throw new NotFoundException('등록되지 않은 유저입니다.');
    }

    // body값과 가드 user 정보가 다르면 에러
    if (findUser.name !== studentName)
      throw new BadRequestException(
        '작성한 사용자 이름과 유저 이름이 다릅니다.',
      );

    if (findUser.userId !== studentId)
      throw new BadRequestException(
        '작성한 사용자 아이디와 유저 아이디가 다릅니다.',
      );

    const existComponentType = await this.submissionRepository.findOne({
      where: { id: findUser.id, componentType },
    });

    if (existComponentType) {
      throw new BadRequestException(
        '똑같은 과제 형식으로 중복 제출은 불가능합니다.',
      );
    }

    if (!submitText) {
      throw new BadRequestException('평가 받을 과제를 제출해주세요.');
    }

    // 영상 & 음성 추출
    // Azure에 비디오 & 오디오 추출 파일 저장
    if (file) {
      const sasUrl = await this.processVideo(file, user.userId);

      return {
        mediaUrl: sasUrl,
      };
    }

    //     const submission = this.submissionRepository.create(createSubmissionDto);
    //     return await this.submissionRepository.save(submission);
  }

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

    // 예시: audio.mp3 업로드
    const audio = await this.uploadToAzureBlob(
      outputAudioPath,
      userId,
      'audio',
    );

    // 예시: video_no_audio.mp4 업로드
    const video = await this.uploadToAzureBlob(
      outputVideoNoAudioPath,
      userId,
      'video',
    );

    return {
      video,
      audio,
    };
  }

  // Azure 클라우스 서비스에 저장하기
  async uploadToAzureBlob(
    filePath: string,
    userId: string,
    fileType: 'audio' | 'video',
  ): Promise<string> {
    // Azure 설정 환경변수 가져오기
    const azureAccount: string = this.configService.get<string>(
      'AZURE_STORAGE_ACCOUNT',
    ) as string;

    const azureAccountKey: string = this.configService.get<string>(
      'AZURE_STORAGE_KEY',
    ) as string;

    const azureContainerName: string = this.configService.get<string>(
      'AZURE_STORAGE_CONTAINER',
    ) as string;

    if (!azureAccount || !azureAccountKey || !azureContainerName) {
      throw new BadRequestException('AZURE 설정 실패');
    }

    // azure storage name과 key를 이용해 azure에 인증한다.
    const realAzureAccount = new StorageSharedKeyCredential(
      azureAccount,
      azureAccountKey,
    );

    // azure 계정을 이용해 azure blob storage에 접속한다.
    const blobServiceClient = new BlobServiceClient(
      `https://${azureAccount}.blob.core.windows.net`,
      realAzureAccount,
    );

    const folderName: string = userId; // 유저 아이디를 이용해 저장
    const fileName: string = uuidv4(); // uuid를 이용해 파일 저장

    // 파일 경로 설정: audio 또는 video 폴더에 저장
    const blobName = path.join(
      folderName,
      fileType,
      `${fileName}.${fileType === 'audio' ? 'mp3' : 'mp4'}`,
    );

    // 컨테이너를 선택한다.
    const containerClient =
      blobServiceClient.getContainerClient(azureContainerName);

    // 파일을 저장한다.
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const fileStream = fs.createReadStream(filePath);

    await blockBlobClient.uploadStream(fileStream);

    // SAS URL 추출
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: azureContainerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'), // read 권한
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1시간 유효
        protocol: SASProtocol.Https,
      },
      realAzureAccount,
    ).toString();

    // 음성 & 동영상파일 SAS url 을 리턴해준다.
    // AI가 음성 영상 데이터로 평가하는 기능도 추가할 예정
    const sasUrl = `${blockBlobClient.url}?${sasToken}`;

    return sasUrl;
  }
}
