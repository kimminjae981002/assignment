import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RevisionService } from './revision.service';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { JwtPayloadInterface } from 'src/auth/interface/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('revision')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('accessToken')
export class RevisionController {
  constructor(private readonly revisionService: RevisionService) {}

  @Post()
  @ApiOperation({ summary: '재평가 제출' })
  async revisionSubmission(
    @Body() createRevisionDto: CreateRevisionDto,
    @CurrentUser() user: JwtPayloadInterface,
  ) {
    return await this.revisionService.revisionSubmission(
      createRevisionDto,
      user,
    );
  }

  @Get()
  @ApiOperation({ summary: '재평가 전체 조회' })
  async findRevisions(
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    return await this.revisionService.findRevisions(page, size);
  }

  @Get(':revisionId')
  @ApiOperation({ summary: '재평가 상세 조회' })
  async findRevision(@Param('revisionId') revisionId: number) {
    return await this.revisionService.findRevision(revisionId);
  }
}
