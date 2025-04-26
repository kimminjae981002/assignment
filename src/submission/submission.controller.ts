import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { SubmissionService } from './submission.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayloadInterface } from 'src/auth/interface/jwt-payload.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('submissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('accessToken')
export class SubmissionController {
  constructor(private readonly submissionsService: SubmissionService) {}

  @Post()
  @ApiOperation({ summary: '과제 제출' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        studentName: { type: 'string' },
        studentId: { type: 'string' },
        componentType: { type: 'string' },
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
    );
  }
}
