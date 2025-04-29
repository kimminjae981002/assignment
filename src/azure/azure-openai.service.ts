import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureOpenAI } from 'openai';

@Injectable()
export class AzureOpenAIService {
  constructor(private readonly configService: ConfigService) {}
  async openAI(prompt: string) {
    // 배포된 openAI KEY & ENDPOINT & DEVELOPMENT & VERSION & MODEL
    const openAIKey = this.configService.get<string>(
      'AZURE_OPENAI_KEY',
    ) as string;
    const openAIEndpoint = this.configService.get<string>(
      'AZURE_OPENAI_ENDPOINT',
    ) as string;
    const openAIName = this.configService.get<string>(
      'AZURE_OPENAI_DEVELOPMENT',
    ) as string;
    const openAIVersion = this.configService.get<string>(
      'AZURE_OPENAI_VERSION',
    ) as string;
    const openAIModel = this.configService.get<string>(
      'AZURE_OPENAI_MODEL',
    ) as string;

    if (
      !openAIEndpoint ||
      !openAIKey ||
      !openAIName ||
      !openAIModel ||
      !openAIVersion
    ) {
      return {
        result: 'failed',
        message: 'Azure OpenAI 정보를 가져오지 못했습니다.',
      };
    }

    // OpenAI에 연동
    const options = {
      endpoint: openAIEndpoint,
      apiKey: openAIKey,
      deployment: openAIName,
      apiVersion: openAIVersion,
    };

    const client = new AzureOpenAI(options);

    try {
      // 답변 가져오기
      const response = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 1,
        top_p: 1,
        model: openAIModel,
      });

      // 답변
      const result = response.choices[0].message.content as string;

      let parsedResponse;

      // 답변을 json 형식으로 변환
      parsedResponse = JSON.parse(result);

      // json이 아닐 시 또한 score, feedback, highlights가 없다면 예외처리
      if (
        !parsedResponse.feedback ||
        !parsedResponse.highlights ||
        !parsedResponse.score ||
        typeof parsedResponse !== 'object'
      ) {
        return {
          result: 'failed',
          message: 'AI에게 답변 받을 떄 원하는 방식이 아닙니다.',
        };
      }

      return {
        result: 'success',
        score: parsedResponse.score,
        feedback: parsedResponse.feedback,
        highlights: parsedResponse.highlights,
      };
    } catch (error) {
      console.error(`error: `, error);
      throw new BadRequestException('OpenAI 호출 실패');
    }
  }
}
