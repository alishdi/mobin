import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RoleName } from '../../../database/entities/role.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
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

    const userPermissions = user.roles.flatMap((role) =>
      role.permissions ? role.permissions.map((p) => p.code) : []
    );

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('شما دسترسی لازم برای انجام این عملیات را ندارید');
    }

    return true;
  }
}