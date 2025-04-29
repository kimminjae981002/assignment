import { Test, TestingModule } from '@nestjs/testing';
import { AzureService } from './azure.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

describe('AzureService', () => {
  let azureService: AzureService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  // 시작마다 주입된다.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AzureService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    azureService = module.get<AzureService>(AzureService);
    configService = module.get<ConfigService>(ConfigService);
  });

  // azure 환경변수 가져오지 못했을 때
  it('should return failed azure config {result: "failed", message: "Azure 정보를 가져오지 못했습니다."}', async () => {
    mockConfigService.get.mockReturnValueOnce(null);

    const result = await azureService.uploadToAzureBlob(
      './uploads/file.mp3',
      'example',
      'audio',
    );

    expect(result).toEqual({
      result: 'failed',
      message: 'AZURE 정보를 가져오지 못했습니다.',
    });
  });

  // azure SasUrl 반환 성공했을 때
  it('should return azure sasUrl {result: "success", message: "https://...."} ', async () => {
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        AZURE_STORAGE_ACCOUNT: 'azure_account',
        AZURE_STORAGE_KEY: 'azure_key',
        AZURE_STORAGE_CONTAINER: 'azure_container',
      };
      return config[key];
    });

    const result = await azureService.uploadToAzureBlob(
      './uploads/file.mp3',
      'example',
      'audio',
    );

    expect(result).toEqual({
      sasUrl: 'https://....',
    });
  });
});
