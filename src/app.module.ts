import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { typeOrmModuleAsyncOptions } from './configs/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { SubmissionModule } from './submission/submission.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
