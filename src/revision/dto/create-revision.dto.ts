import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class CreateRevisionDto {
  @ApiProperty({
    description: '재평가 이유',
    example: '수정해서 다시 평가 받고 싶습니다.',
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
