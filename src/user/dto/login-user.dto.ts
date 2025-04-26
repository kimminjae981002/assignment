import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// 로그인
export class LoginUserDto extends PickType(CreateUserDto, [
  'userId',
  'password',
] as const) {}
