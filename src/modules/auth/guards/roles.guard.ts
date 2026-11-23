import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleName } from '../../../database/entities/role-permission/role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles || user.roles.length === 0) {
      throw new ForbiddenException('شما به این بخش دسترسی ندارید');
    }

    const userRoleNames = user.roles.map((role) => role.name);

    if (userRoleNames.includes(RoleName.SUPER_ADMIN)) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => userRoleNames.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('نقش شما برای دسترسی به این بخش کافی نیست');
    }

    return true;
  }
}