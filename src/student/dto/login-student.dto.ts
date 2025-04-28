import { PickType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';

// 로그인
export class LoginStudentDto extends PickType(CreateStudentDto, [
  'studentId',
  'password',
] as const) {}
