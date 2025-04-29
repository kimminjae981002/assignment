import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signUp: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    it('should call authService.signUp controller.signup return {success:true, message: string}', async () => {
      const dto = {
        studentId: 'test',
        password: '1234',
        email: 'test@test.com',
        gender: 'male',
        name: 'Test Student',
        level: 1,
        birthDate: '2000-01-01',
      };

      const expectedResponse = {
        success: true,
        message: '회원가입에 성공했습니다.',
      };

      // authService에서 반환하는 값
      mockAuthService.signUp.mockResolvedValue(expectedResponse);

      // 실제 controller
      const result = await authController.signUp(dto);

      // authService.signUp이 실행됐나
      expect(authService.signUp).toHaveBeenCalledWith(dto);

      // 반환 값과 맞냐
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('login', () => {
    it('should call authService.login authController.login return access & refresh tokens', async () => {
      const dto = {
        studentId: 'test',
        password: '1234',
      };

      const expectedTokens = {
        success: true,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      // mock 함수 login
      mockAuthService.login.mockResolvedValue(expectedTokens);

      const result = await authController.login(dto);

      // login이 호출됏나
      expect(authService.login).toHaveBeenCalledWith(dto);

      // controller return 값과 같냐
      expect(result).toEqual(expectedTokens);
    });
  });
});
