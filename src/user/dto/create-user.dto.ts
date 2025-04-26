import { ApiProperty } from '@nestjs/swagger'; // Swagger 데코레이터
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender, UserRole } from 'src/common/enums/user.enum';

// 회원가입
export class CreateUserDto {
  @ApiProperty({ description: 'User ID', example: 'example123' })
  @IsNotEmpty()
  @MinLength(5, { message: '아이디는 최소 5자 이상이어야 합니다.' })
  @MaxLength(20, { message: '아이디는 최대 20자 이하이어야 합니다.' })
  userId: string;

  @ApiProperty({ description: 'User Password', example: 'Example123!' })
  @IsNotEmpty()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 최대 20자 이하이어야 합니다.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/,
    {
      message:
        '비밀번호는 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.',
    },
  )
  password: string;

  @ApiProperty({ description: 'Email', example: 'example@example.com' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '이름', example: 'example' })
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '이름은 최대 20자 이하이어야 합니다.' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '학생 레벨', example: 1, required: false })
  @IsOptional()
  level: number;

  @ApiProperty({
    description: '성별',
    enum: Gender,
    example: 'male | female | secret',
  })
  @IsNotEmpty()
  @IsEnum(Gender, { message: '잘못된 성별 값입니다.' })
  gender: Gender;

  @ApiProperty({ description: '생년월일', example: '2000-01-01' })
  @IsDateString({ strict: true })
  birthDate: string;
}
