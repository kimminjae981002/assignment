import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { SubmissionService } from './submission.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayloadInterface } from 'src/auth/interface/jwt-payload.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { FindSubmissionsDto } from './dto/find-submission.dto';
import { sendSubmissionResponseDto } from './dto/send-submission-response.dto';

@Controller('submissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('accessToken')
export class SubmissionController {
  constructor(private readonly submissionsService: SubmissionService) {}

  @Post()
  @ApiOperation({ summary: '평가 제출' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Successful Response',
    type: sendSubmissionResponseDto, // 응답 DTO 클래스 지정
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        studentName: { type: 'string', example: 'example' },
        studentId: { type: 'string', example: 'example123' },
        submitText: {
          type: 'string',
          example:
            'Right now, I am writing a report for my English class My classmates are preparing their presentations in the library Meanwhile, our teacher is checking the homework we submitted last week',
        },
        componentType: { type: 'string', example: 'Speaking' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async sendSubmission(
    @Body() createSubmissionDto: CreateSubmissionDto,
    @CurrentUser() user: JwtPayloadInterface,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.submissionsService.sendSubmission(
      createSubmissionDto,
      user,
      file,
    );
  }

  @Get()
  @ApiOperation({ summary: '평가 전체 조회' })
  async findSubmissions(
    @Query('page') page: number,
    @Query('size') size: number,
    @Query() findSubmissionsDto: FindSubmissionsDto,
  ) {
    return await this.submissionsService.findSubmissions(
      page,
      size,
      findSubmissionsDto,
    );
  }

  @Get(':submissionId')
  @ApiOperation({ summary: '평가 상세 조회' })
  async findSubmission(@Param('submissionId') submissionId: number) {
    return await this.submissionsService.findSubmission(submissionId);
  }
}
