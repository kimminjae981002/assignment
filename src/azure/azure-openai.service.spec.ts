import { Test, TestingModule } from '@nestjs/testing';
import { AzureOpenAIService } from './azure-openai.service';
import { ConfigService } from '@nestjs/config';

describe('AzureOpenAIService', () => {
  function mockAzureResponse(content: string) {
    const mockClient = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValueOnce({
            choices: [
              {
                message: {
                  content,
                },
              },
            ],
          }),
        },
      },
    };

    // 내부에 직접 mockClient 주입
    (azureOpenAIService as any).client = mockClient;
  }

  let azureOpenAIService: AzureOpenAIService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AzureOpenAIService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    azureOpenAIService = module.get<AzureOpenAIService>(AzureOpenAIService);
    configService = module.get<ConfigService>(ConfigService);
  });

  // azureOpenAIService 존재하냐?
  it('should be defined', () => {
    expect(azureOpenAIService).toBeDefined();
  });

  // openAI 검증 테스트 환경변수를 못 가져올 때
  describe('openAI', () => {
    it('should return failed openai config {result: "failed", message: "Azure OpenAI 정보를 가져오지 못했습니다."} ', async () => {
      mockConfigService.get.mockReturnValueOnce(null);

      const result = await azureOpenAIService.openAI('test');

      expect(result).toEqual({
        result: 'failed',
        message: 'Azure OpenAI 정보를 가져오지 못했습니다.',
      });
    });

    // ai에게 답변 받은 형식이 내가 원하는 형식이 아닐 때
    it('should return failed openai json {result: "failed", AI에게..."} ', async () => {
      // 잘못된 응답 구조를 모킹
      mockAzureResponse('{"score": 7}'); // feedback, highlights 누락

      const result = await azureOpenAIService.openAI('test');

      expect(result).toEqual({
        result: 'failed',
        message: 'AI에게 답변 받을 떄 원하는 방식이 아닙니다.',
      });
    });

    // openAI 연결과 답변 받아오기
    it('should return azure openai answer {result: "success", ..."} ', async () => {
      // 환경변수 옵션을 만들어준다.
      mockConfigService.get.mockImplementation((key: string) => {
        const config = {
          AZURE_OPENAI_ENDPOINT: 'ai_endpoint',
          AZURE_OPENAI_DEVELOPMENT: 'ai_development',
          AZURE_OPENAI_VERSION: 'ai_version',
          AZURE_OPENAI_KEY: 'ai_key',
          AZURE_OPENAI_MODEL: 'ai_model',
        };
        return config[key];
      });

      mockAzureResponse(
        JSON.stringify({
          score: 7,
          feedback: '잘했지만...',
          highlights: ['abc', 'def'],
        }),
      );

      const result = await azureOpenAIService.openAI('test');

      expect(result).toEqual({
        result: 'success',
        score: 7,
        feedback: '잘했지만...',
        highlights: ['abc', 'def'],
      });
    });
  });
});
