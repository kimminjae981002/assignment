import { LoginUserDto } from './../user/dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // 유저 회원가입
  async signUp(createUserDto: CreateUserDto): Promise<User> {
    const { userId, password, email } = createUserDto;

    // 이미 존재하는 유저 찾기
    const existUser: User | null = await this.findUserId(userId);

    if (existUser) {
      throw new ConflictException('해당 아이디로는 가입할 수 없습니다.');
    }

    // 이미 존재하는 이메일 찾기
    const existEmail: User | null = await this.userRepository.findOne({
      where: { email },
    });

    if (existEmail) {
      throw new ConflictException('해당 이메일로는 가입할 수 없습니다.');
    }

    // bcrypt에서 찾을 해쉬 찾기
    const hashRounds: number =
      this.configService.get<number>('HASH_ROUNDS') ?? 10;

    // 비밀번호 암호화
    const hashedPassword: string = await bcrypt.hash(password, +hashRounds);

    // 유저 엔티티 생성
    const newUser: User = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // 유저 저장
    return await this.userRepository.save(newUser);
  }

  // 로그인
  async login(loginUserDto: LoginUserDto) {
    const { userId, password } = loginUserDto;

    // 존재하는 유저인지 찾기
    const user: User | null = await this.findUserId(userId);

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    // 암호화 비밀번호 체크
    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 틀렸습니다.');
    }

    // access token payload
    const accessTokenPayload = {
      userId: user.userId,
      sub: user.id,
      tokenType: 'access',
    };

    // refresh token payload
    const refreshTokenPayload = {
      userId: user.userId,
      sub: user.id,
      tokenType: 'refresh',
    };

    // accessToken 유효 기간15분
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: '15m',
    });

    // refreshToken 유효 기간 7일
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: '7d',
    });

    return {
      success: true,
      accessToken,
      refreshToken,
    };
  }

  // 유저 아이디 찾기
  async findUserId(userId: string) {
    return await this.userRepository.findOne({ where: { userId: userId } });
  }
}
