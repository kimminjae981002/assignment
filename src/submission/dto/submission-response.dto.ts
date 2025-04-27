import { ApiProperty } from '@nestjs/swagger';

export class SubmissionResponseDto {
  @ApiProperty({ example: '2025-04-04...' })
  createdAt: string;

  @ApiProperty({ example: '2025-04-04...' })
  updatedAt: string;

  @ApiProperty({ example: 5 })
  id: string;

  @ApiProperty({ example: 'example' })
  videoFile: string;

  @ApiProperty({ example: 'complete' })
  status: number;

  @ApiProperty({ example: '전반적으로 잘 작성하였습니다. 하지만...' })
  submitText: string;

  @ApiProperty({ example: 7 })
  score: string[];

  @ApiProperty({
    example: 'Essay Whiting',
  })
  componentType: string;

  @ApiProperty({ example: '전반적으로 잘 작성하였습니다. 하지만 ...' })
  feedback: string;

  @ApiProperty({ example: ['Right now', 'is checking'] })
  highlights: string[];

  @ApiProperty({ example: 'url, path' })
  metadata: string;
}
