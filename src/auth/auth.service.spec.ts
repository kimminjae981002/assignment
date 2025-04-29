import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

// 실제 메서드를 작성해야한다.
// mock 함수 정의
const mockStudentRepository = {
  save: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  compare: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let studentRepository: Repository<Student>;
  let configService: ConfigService;
  let jwtService: JwtService;

  // 시작할 때마다 모의 객체를 주입한다.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Student),
          useValue: mockStudentRepository,
        }, // student 엔티티를 mockRepository로 바꿔라
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    studentRepository = module.get<Repository<Student>>(
      getRepositoryToken(Student),
    );
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
  });

  // authService가 존재하냐?
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  // findStudentId 검증 테스트
  describe('findStudentId', () => {
    // student를 반환해야한다.
    it('should return student', async () => {
      // 가상 객체
      const student = {
        id: 1,
        studentId: 'test',
        email: 'test@test.com',
        gender: 'famale',
        password: 'hashPassword',
        level: 1,
        name: 'test',
        birthDate: '2025-01-01',
        paymentDate: null,
      };

      // 가상 객체를 사용하여 반환한다.
      mockStudentRepository.findOne.mockResolvedValueOnce(student);

      // 실제 서비스 로직을 사용하여 mock 함수에서 반환한다.
      const result = await authService.findStudent(student.studentId);

      // 실제 service 로직과 mock 로직 return 값이 같다.
      expect(result?.studentId).toEqual(student.studentId);

      // 한 번은 호출은 되었는지 확인한다.
      expect(mockStudentRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('signUp', () => {
    it('should throw ConflictException if only studentId exists', async () => {
      // 테스트 시작 시 명시적으로 초기화
      mockStudentRepository.findOne.mockClear();

      const createStudentDto = {
        studentId: 'test',
        password: 'password123',
        email: 'test@test.com',
        gender: 'secret',
        name: 'test',
        level: 1,
        birthDate: '2011-05-05',
      };

      const dto = { ...createStudentDto };

      mockStudentRepository.findOne.mockResolvedValueOnce({
        studentId: 'test',
      }); // studentId 존재

      const result = await authService.signUp(dto);

      expect(result).toEqual({
        result: 'failed',
        message: '이미 존재하는 아이디입니다.',
      });

      expect(mockStudentRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if only email exists', async () => {
      // 테스트 시작 시 명시적으로 초기화
      mockStudentRepository.findOne.mockClear();

      const createStudentDto = {
        studentId: 'test',
        password: 'password123',
        email: 'test@test.com',
        gender: 'secret',
        name: 'test',
        level: 1,
        birthDate: '2011-05-05',
      };

      const dto = { ...createStudentDto };

      mockStudentRepository.findOne.mockResolvedValueOnce(null); // studentId 존재

      mockStudentRepository.findOne.mockResolvedValueOnce({
        email: 'test@test.com',
      }); // email 존재

      const result = await authService.signUp(dto);

      expect(result).toEqual({
        result: 'failed',
        message: '이미 존재하는 이메일입니다.',
      });

      // findOne 메서드 호출 확인
      expect(mockStudentRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should return {success:true, message:"회원가입에 성공했습니다."}', async () => {
      // 테스트 시작 시 명시적으로 초기화
      mockStudentRepository.findOne.mockClear();

      // 가상 dto 생성
      const createStudentDto = {
        studentId: 'test',
        password: 'password123',
        email: 'test@test.com',
        gender: 'secret',
        name: 'test',
        level: 1,
        birthDate: '2011-05-05',
      };

      // 가상 student 생성
      const student = {
        id: 1,
        studentId: 'test',
        email: 'test@test.com',
        gender: 'female',
        password: 'hashPassword',
        level: 1,
        name: 'test',
        birthDate: '2025-01-01',
        paymentDate: null,
      };

      // 중복 아이디 없다고 가정
      mockStudentRepository.findOne.mockResolvedValueOnce(null);
      // 중복 이메일 없다고 가정
      mockStudentRepository.findOne.mockResolvedValueOnce(null);

      // bcrypt hash mock
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      // 실제 서비스 로직 테스트
      mockStudentRepository.create.mockReturnValue(student);
      mockStudentRepository.save.mockResolvedValue(student);

      // 실제 서비스 로직
      const result = await authService.signUp(createStudentDto);

      expect(result).toEqual({
        success: true,
        message: '회원가입에 성공했습니다.',
      });

      // findOne 메서드 호출 확인
      expect(mockStudentRepository.findOne).toHaveBeenCalledTimes(2);

      // student 객체로 저장이 됏는지
      expect(mockStudentRepository.save).toHaveBeenCalledWith(student);
    });
  });

  describe('login', () => {
    it('should throw NotFoundException Student', async () => {
      mockStudentRepository.findOne.mockClear();

      const loginStudentDto = {
        studentId: 'test',
        password: 'password123',
      };

      const dto = { ...loginStudentDto };

      // 계정이 없다고 가정
      mockStudentRepository.findOne.mockResolvedValueOnce(null);

      // 실제 서비스 로직
      const result = await authService.login(dto);

      expect(result).toEqual({
        result: 'failed',
        message: '존재하지 않는 유저입니다.',
      });

      expect(mockStudentRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw Student fail password ', async () => {
      // 테스트 시작 시 명시적으로 초기화
      mockStudentRepository.findOne.mockClear();
      const loginStudentDto = {
        studentId: 'test',
        password: 'password123',
      };

      const dto = { ...loginStudentDto };

      // 계정이 있다고 설정
      mockStudentRepository.findOne.mockResolvedValueOnce(loginStudentDto);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      // 실제 서비스 로직
      const result = await authService.login(dto);

      expect(result).toEqual({
        result: 'failed',
        message: '아이디 또는 비밀번호가 틀렸습니다.',
      });

      expect(mockStudentRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return {success:true, accessToken:"accessToken", refreshToken: "refreshToken"}', async () => {
      // 테스트 시작 시 명시적으로 초기화
      mockStudentRepository.findOne.mockClear();
      bcrypt.compare.mockClear();

      // 가상 dto 생성
      const loginStudentDto = {
        studentId: 'test',
        password: 'password123',
      };

      // 가상 student 생성
      const student = {
        id: 1,
        studentId: 'test',
        email: 'test@test.com',
        gender: 'famale',
        password: 'hashPassword',
        level: 1,
        name: 'test',
        birthDate: '2025-01-01',
        paymentDate: null,
      };

      // 계정이 있다고 mock
      mockStudentRepository.findOne.mockResolvedValueOnce(student);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true); // 비밀번호 일치하는 것으로 설정

      mockJwtService.sign = jest.fn().mockImplementation((payload, options) => {
        if (payload.tokenType === 'access') return 'accessToken';
        if (payload.tokenType === 'refresh') return 'refreshToken';
      });

      // 실제 서비스 로직
      const result = await authService.login(loginStudentDto);

      expect(result).toEqual({
        success: true,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      // findOne 메서드 호출 확인
      expect(mockStudentRepository.findOne).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });
  });
});
