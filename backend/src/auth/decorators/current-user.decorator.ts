import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 从 JWT 校验后的 request.user 中取当前用户。
 * 用法：@CurrentUser() user 或 @CurrentUser('sub') userId
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return undefined;
    }
    return data ? user[data] : user;
  },
);
