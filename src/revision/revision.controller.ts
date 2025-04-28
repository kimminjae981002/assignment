import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RevisionService } from './revision.service';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { JwtPayloadInterface } from 'src/auth/interface/jwt-payload.interface';
import { CurrentStudent } from 'src/common/decorators/current-student.decorator';
import { RevisionResponseDto } from './dto/revision-response.dto';
import { SubmissionResponseDto } from 'src/submission/dto/submission-response.dto';

@Controller('revision')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('accessToken')
export class RevisionController {
  constructor(private readonly revisionService: RevisionService) {}

  @Post()
  @ApiOperation({ summary: '재평가 제출' })
  @ApiResponse({
    status: 201,
    description: '재평가 제출 성공',
    example: {
      result: 'ok',
      message: '해당 평가에 대해 재평가 되었습니다. ',
    },
  })
  async revisionSubmission(
    @Body() createRevisionDto: CreateRevisionDto,
    @CurrentStudent() student: JwtPayloadInterface,
  ) {
    return await this.revisionService.revisionSubmission(
      createRevisionDto,
      student,
    );
  }

  @Get()
  @ApiOperation({ summary: '재평가 전체 조회' })
  @ApiResponse({
    status: 200,
    description: '재평가 전체 조회',
    type: RevisionResponseDto,
  })
  async findRevisions(
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    return await this.revisionService.findRevisions(page, size);
  }

  @Get(':revisionId')
  @ApiResponse({
    status: 200,
    description: '재평가 상세 조회',
    type: RevisionResponseDto,
  })
  @ApiOperation({ summary: '재평가 상세 조회' })
  async findRevision(@Param('revisionId') revisionId: number) {
    return await this.revisionService.findRevision(revisionId);
  }
}
