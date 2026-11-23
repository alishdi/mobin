import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../../../database/entities/role-permission/role.entity';

export const ROLES_KEY = 'roles';

/**
 * دکوریتور برای مشخص کردن نقش‌های مجاز برای یک مسیر
 * 
 * @example
 * @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
 * @Get('users')
 * findAllUsers() { ... }
 */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);