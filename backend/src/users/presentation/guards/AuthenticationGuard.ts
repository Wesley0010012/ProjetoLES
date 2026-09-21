import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { Unauthorized } from 'src/shared/domain/errors/Unauthorized';
import { ValidateSession } from '../../application/usecases/ValidateSession';
import type { AuthenticatedRequest } from '../middlewares/TokenValidationMiddleware';
import { UserType } from '../../domain/enums/UserType';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly authentication: ValidateSession) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const path = request.path;
    if (
      (request.method === 'POST' &&
        [
          '/auth/demo-session',
          '/auth/sign-in',
          '/auth/sign-up',
        ].includes(path)) ||
      (request.method === 'GET' &&
        (path.startsWith('/storefront/') ||
          path === '/books' ||
          path.startsWith('/books/') ||
          path === '/categories' ||
          path === '/metadata/customer-options'))
    )
      return true;
    const user = await this.authentication.execute(
      request.headers.authorization?.replace(/^Bearer\s+/i, '') ?? '',
    );
    request.authenticatedUser = user;
    if (path.startsWith('/admin/') && user.type !== UserType.OPERATOR)
      throw new Unauthorized(MessageKeyEnum.ACCESS_DENIED);
    if (
      (path === '/customer' || path.startsWith('/customer/')) &&
      user.type !== UserType.USER
    )
      throw new Unauthorized(MessageKeyEnum.ACCESS_DENIED);
    const self = path.match(/^\/users\/(\d+)(\/customer)?/);
    if (
      self &&
      (user.id !== Number(self[1]) || (self[2] && user.type !== UserType.USER))
    )
      throw new Unauthorized(MessageKeyEnum.ACCESS_DENIED);
    return true;
  }
}
