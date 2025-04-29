import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

// 실제 메서드를 작성해야한다.
const mockStudentRepository = {
  signUp: jest.fn(),
  login: jest.fn(),
  findOne: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('jwt-secret-key'), // 실제 사용하는 config 키를 맞춰줍니다
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
};

describe('AuthService', () => {
  let authService: AuthService;

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
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('findStudentId', () => {
    it('should return student', async () => {
      const student = {
        id: 1,
        studentId: 'test',
        email: 'test@test.com',
        gender: 'famale',
      };
      mockStudentRepository.findOne.mockResolvedValue(student);

      const result = await authService.findStudentId(student.studentId);

      // 실제 service 로직과 mock 로직 return 값이 같다.
      expect(result).toEqual(student);

      // 실행이 되고 있나
      expect(mockStudentRepository.findOne).toHaveBeenCalled();
    });
  });
});
