import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('دسترسی غیرمجاز: کاربر احراز هویت نشده یا نقش ندارد');
    }

    const userRoleName = user.role.name;
    const userPermissions = user.role.permissions.map((p: any) => p.name);

    if (requiredRoles && !requiredRoles.includes(userRoleName) && userRoleName !== 'super_admin') {
      throw new ForbiddenException(`دسترسی غیرمجاز: نقش شما (${userRoleName}) اجازه این کار را ندارد`);
    }

    if (requiredPermissions && userRoleName !== 'super_admin') {
      const hasPermission = requiredPermissions.every((perm) => userPermissions.includes(perm));
      if (!hasPermission) {
        throw new ForbiddenException('دسترسی غیرمجاز: شما مجوز انجام این عملیات را ندارید');
      }
    }

    return true;
  }
}