import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { typeOrmModuleAsyncOptions } from './configs/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { SubmissionModule } from './submission/submission.module';
import { VideoService } from './video/video.service';
import { VideoModule } from './video/video.module';
import { AzureModule } from './azure/azure.module';
import { RevisionModule } from './revision/revision.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleAsyncOptions),
    AuthModule,
    UserModule,
    SubmissionModule,
    VideoModule,
    AzureModule,
    RevisionModule,
  ],
  controllers: [AppController],
  providers: [AppService, VideoService],
})
export class AppModule {}
