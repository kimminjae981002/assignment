import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { Request } from 'express';
import { SubmissionService } from './submission.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayloadInterface } from 'src/auth/interface/jwt-payload.interface';

@Controller('submissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('accessToken')
export class SubmissionController {
  constructor(private readonly submissionsService: SubmissionService) {}

  @Post()
  async sendSubmission(
    @Body() createSubmissionDto: CreateSubmissionDto,
    @CurrentUser() user: JwtPayloadInterface,
  ) {
    return await this.submissionsService.sendSubmission(
      createSubmissionDto,
      user,
    );
  }
}
