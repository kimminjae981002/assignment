import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateStudentDto } from 'src/student/dto/create-student.dto';
import { LoginStudentDto } from 'src/student/dto/login-student.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입 API
  @Post('signUp')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    example: { success: true, message: '회원가입에 성공했습니다.' },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 409, description: '이미 존재하는 유저' })
  async signUp(@Body() createStudentDto: CreateStudentDto) {
    return await this.authService.signUp(createStudentDto);
  }

  // 로그인 API
  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 201,
    description: '로그인 성공',
    example: {
      success: true,
      accessToken: 'eiAvlsioVAA...',
      refreshToken: 'eyaACVao',
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async login(@Body() loginStudentDto: LoginStudentDto) {
    return await this.authService.login(loginStudentDto);
  }
}
