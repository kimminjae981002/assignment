import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginUserDto } from 'src/user/dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입 API
  @Post('signUp')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 409, description: '이미 존재하는 유저' })
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }

  // 로그인 API
  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 201, description: '로그인 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto);
  }
}
