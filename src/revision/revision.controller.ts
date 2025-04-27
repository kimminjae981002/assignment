import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
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

  @Post(':submissionId')
  @ApiOperation({ summary: '재평가 제출' })
  async revisionSubmission(
    @Param('submissionId') submissionId: number,
    @Body() createRevisionDto: CreateRevisionDto,
    @CurrentUser() user: JwtPayloadInterface,
  ) {
    return await this.revisionService.revisionSubmission(
      submissionId,
      createRevisionDto,
      user,
    );
  }
}
