import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 정적 파일 제공 설정 (uploads 폴더)
  app.useStaticAssets(path.join(__dirname, 'uploads'), {
    prefix: '/uploads/', // URL 경로에 /uploads 를 붙여서 접근할 수 있도록 설정
  });

  // PORT 환경변수
  const configService = app.get(ConfigService);
  const PORT: number = configService.get<number>('SERVER_PORT') ?? 3000;

  // DTO class-validator 에러 메시지
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('AI 기반 영어 과제 평가')
    .setDescription('학생의 영어 과제를 평가하는 API 문서')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'accessToken',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagSorter: 'alpha',
      operationSorter: 'alpha',
    },
  });

  await app.listen(PORT);
}
bootstrap();
