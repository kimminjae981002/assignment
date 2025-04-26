import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  // 유저 회원가입
  async signUp(createUserDto: CreateUserDto): Promise<User> {
    const { userId, password, email } = createUserDto;

    // 이미 존재하는 유저 찾기
    const existUser: User | null = await this.userRepository.findOne({
      where: { userId: userId },
    });

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
}
