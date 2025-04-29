import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  Max,
  Min,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ComponentType, Status } from 'src/common/enums/submission.enum';

export class CreateSubmissionDto {
  @ApiProperty({
    description: '유저 아이디',
    example: 'example123',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: '유저 이름',
    example: 'example',
  })
  @IsString()
  @IsNotEmpty()
  studentName: string;

  @ApiProperty({
    description: '과제 주제',
    example: 'Writing | Speaking',
  })
  @IsEnum(ComponentType)
  @IsNotEmpty()
  componentType: string;

  @ApiProperty({
    description: '제출 상세 내용',
    example: 'what is the title?',
  })
  @IsString()
  @IsNotEmpty()
  submitText: string;
}
