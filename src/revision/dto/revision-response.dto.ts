import { ApiProperty } from '@nestjs/swagger';
import { SubmissionResponseDto } from 'src/submission/dto/submission-response.dto';

export class RevisionResponseDto extends SubmissionResponseDto {
  @ApiProperty({ example: '마음에 들지 않아다시 평가 받고 싶습니다.' })
  revision_reason: string;

  @ApiProperty({ example: true })
  isRevision: boolean;
}
