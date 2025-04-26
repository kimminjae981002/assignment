import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  Max,
  Min,
  IsString,
  IsOptional,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { Status } from 'src/common/entities/enums/submission.enum';

export class CreateSubmissionDto {
  @ApiProperty({
    description: '비디오 파일 원본 URL',
    example: 'file.mp4',
  })
  @IsNotEmpty()
  @IsString()
  fileUrl: string;

  @ApiProperty({
    description: '평가 상태',
    enum: Status,
    example: 'waiting',
  })
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;

  @ApiProperty({
    description: '평가 점수',
    example: 90,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({
    description: '평가에 대한 AI 피드백',
    example:
      '발음이 훌륭하지만 속도가 매우 느리네요. 조금 더 노력하면 많이 발전할 수 있습니다.',
  })
  @IsOptional()
  @IsString()
  feedback: string;

  @ApiProperty({
    description: '평가에 대한 고칠 부분 표시',
    example: 'abcd eda',
  })
  @IsOptional()
  @IsString()
  highlights: string;

  @ApiProperty({
    description: '파일 원본 URL에 대한 정보',
    example: '{fileURL: file.mp4, 내용: 내용}',
  })
  @IsNotEmpty()
  metadata: object;
}
