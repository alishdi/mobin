import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../../database/entities/user.entity';

/**
 * 
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * 
 * @example
 * @Get('my-id')
 * getMyId(@CurrentUser('id') userId: string) {
 *   return userId;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) return null;
    return data ? user[data] : user;
  },
);