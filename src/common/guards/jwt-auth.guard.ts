import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../constants';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];
    const cookieToken: string | undefined = request.cookies?.['sp_access_token'];

    let token: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (cookieToken) {
      // Verify CSRF header when cookie-based auth is used on state-changing requests
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        const csrfCookie = request.cookies?.['sp_csrf_token'];
        const csrfHeader = request.headers['x-csrf-token'];
        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
          throw new UnauthorizedException({
            message: 'CSRF token validation failed',
            code: 'CSRF_TOKEN_INVALID',
          });
        }
      }
      token = cookieToken;
    }

    if (!token) {
      throw new UnauthorizedException({
        message: 'Authentication token is required',
        code: 'MISSING_AUTH_TOKEN',
      });
    }

    const user = await this.authService.verifyAccessTokenAndSession(token);
    request.user = user;
    return true;
  }
}
