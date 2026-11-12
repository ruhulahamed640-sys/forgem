import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../constants';
import { AuthenticatedUser } from '../interfaces/api-response.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;
    if (!user || !Array.isArray(user.roles)) {
      throw new ForbiddenException({
        message: 'Insufficient role permissions',
        code: 'FORBIDDEN_ROLE',
      });
    }

    // SUPER_ADMIN inherits all administrative privileges
    if (user.roles.includes('SUPER_ADMIN')) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException({
        message: `Required role(s): ${requiredRoles.join(', ')}`,
        code: 'FORBIDDEN_ROLE',
      });
    }
    return true;
  }
}
