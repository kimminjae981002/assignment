import { ApiProperty } from '@nestjs/swagger';

export class MediaUrl {
  @ApiProperty({ example: 'https://example.com/video.mp4' })
  video: string;

  @ApiProperty({ example: 'https://example.com/audio.mp3' })
  audio: string;
}

export class sendSubmissionResponseDto {
  @ApiProperty({ example: 'ok' })
  result: string;

  @ApiProperty({ example: 'null' })
  message: string;

  @ApiProperty({ example: 'example' })
  studentId: string;

  @ApiProperty({ example: 'example' })
  studentName: string;

  @ApiProperty({ example: 7 })
  score: number;

  @ApiProperty({ example: '전반적으로 잘 작성하였습니다. 하지만...' })
  feedback: string;

  @ApiProperty({ example: ['Right now', 'is checking'] })
  highlights: string[];

  @ApiProperty({
    example: 'Right now, I am writing a report for my English...',
  })
  submitText: string;

  @ApiProperty({ example: '<b>Right now</b> ...' })
  highlightSubmitText: string;

  @ApiProperty({
    type: () => MediaUrl, // MediaUrl 타입을 사용
    example: {
      video: 'https://example.com/video.mp4',
      audio: 'https://example.com/audio.mp3',
    },
  })
  mediaUrl: MediaUrl;

  @ApiProperty({ example: 5612 })
  apiLatency: number;
}
