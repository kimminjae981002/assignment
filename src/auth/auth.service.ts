import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Student } from 'src/student/entities/student.entity';
import { CreateStudentDto } from 'src/student/dto/create-student.dto';
import { LoginStudentDto } from 'src/student/dto/login-student.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // 유저 회원가입
  async signUp(createStudentDto: CreateStudentDto) {
    const { studentId, password, email } = createStudentDto;

    // 이미 존재하는 유저 찾기
    const existStudent: Student | null = await this.findStudentId(studentId);

    if (existStudent) {
      throw new ConflictException('해당 아이디로는 가입할 수 없습니다.');
    }

    // 이미 존재하는 이메일 찾기
    const existEmail: Student | null = await this.studentRepository.findOne({
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
    const newStudent: Student = this.studentRepository.create({
      ...createStudentDto,
      password: hashedPassword,
    });

    // 유저 저장
    await this.studentRepository.save(newStudent);

    return {
      success: true,
      message: '회원가입에 성공했습니다.',
    };
  }

  // 로그인
  async login(loginStudentDto: LoginStudentDto) {
    const { studentId, password } = loginStudentDto;

    // 존재하는 유저인지 찾기
    const student: Student | null = await this.findStudentId(studentId);

    if (!student) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    // 암호화 비밀번호 체크
    const comparePassword = await bcrypt.compare(password, student.password);

    if (!comparePassword) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 틀렸습니다.');
    }

    // access token payload
    const accessTokenPayload = {
      studentId: student.studentId,
      sub: student.id,
      tokenType: 'access',
    };

    // refresh token payload
    const refreshTokenPayload = {
      studentId: student.studentId,
      sub: student.id,
      tokenType: 'refresh',
    };

    // accessToken 유효 기간15분
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: '1d',
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
  async findStudentId(studentId: string) {
    return await this.studentRepository.findOne({ where: { studentId } });
  }
}
