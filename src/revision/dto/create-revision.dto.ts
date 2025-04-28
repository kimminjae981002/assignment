import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsInt } from 'class-validator';

export class CreateRevisionDto {
  @ApiProperty({
    description: '재평가 받을 평가 고유아이디',
    example: 10,
  })
  @IsInt()
  @IsNotEmpty()
  submission_id: number;

  @ApiProperty({
    description: '재평가 이유',
    example: '마음에 들지 않아 다시 평가 받고 싶습니다.',
  })
  @IsString()
  @IsNotEmpty()
  revision_reason: string;

  @ApiProperty({
    description: '재평가 요청',
    example: 'true',
  })
  @IsBoolean()
  @IsNotEmpty()
  isRevision: boolean;
}
