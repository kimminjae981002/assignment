import { ApiProperty } from '@nestjs/swagger'; // Swagger 데코레이터

// 회원가입 DTO
export class CreateUserDto {
  @ApiProperty({ description: 'User ID', example: 'example123' })
  userId: string;

  @ApiProperty({ description: 'User Password', example: 'Example123!' })
  password: string;

  @ApiProperty({ description: 'Email', example: 'example@example.com' })
  email: string;

  @ApiProperty({ description: '이름', example: 'example' })
  name: string;

  @ApiProperty({ description: '나이', example: 20 })
  age: number;

  @ApiProperty({
    description: '사용자 역할',
    enum: ['student', 'admin'],
    example: 'student',
  })
  role: string;

  @ApiProperty({ description: '학생 레벨', example: 1, required: false })
  level: number;

  @ApiProperty({
    description: '성별',
    enum: ['male', 'female', 'secret'],
    example: 'male',
  })
  gender: string;

  @ApiProperty({ description: '생년월일', example: '2000-01-01' })
  birthDate: Date;
}
