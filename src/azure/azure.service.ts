import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
export class AzureService {
  constructor(private readonly configService: ConfigService) {}
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
