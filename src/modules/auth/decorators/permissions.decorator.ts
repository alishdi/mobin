import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * دکوریتور برای مشخص کردن دسترسی‌های مجاز برای یک مسیر
 * 
 * @example
 * @Permissions('users:create', 'users:read')
 * @Post('users')
 * createUser() { ... }
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);