import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// JwtStrategy에서 반환한 값을 데코레이터로 만들어준다.
export const CurrentStudent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
