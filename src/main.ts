import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
      'access',
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
