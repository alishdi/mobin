import { PermissionResource, PermissionAction } from '../../database/entities/permission.entity';

/**
 * تعریف ساختار یک دسترسی
 */
export interface PermissionDefinition {
    resource: PermissionResource;
    action: PermissionAction;
    code: string;
    displayName: string;
    description?: string;
}

/**
 * تمام دسترسی‌های سیستم در یک نقطه متمرکز
 */
export const PERMISSIONS = {
    // ==================== کاربران ====================
    USERS_CREATE: {
        resource: PermissionResource.USERS,
        action: PermissionAction.CREATE,
        code: 'users:create',
        displayName: 'ایجاد کاربر',
        description: 'امکان ثبت کاربر جدید در سیستم',
    },
    USERS_READ: {
        resource: PermissionResource.USERS,
        action: PermissionAction.READ,
        displayName: 'مشاهده کاربر',
        code: 'users:read',
    },
    USERS_UPDATE: {
        resource: PermissionResource.USERS,
        action: PermissionAction.UPDATE,
        displayName: 'ویرایش کاربر',
        code: 'users:update',
    },
    USERS_DELETE: {
        resource: PermissionResource.USERS,
        action: PermissionAction.DELETE,
        displayName: 'حذف کاربر',
        code: 'users:delete',
    },
    USERS_LIST: {
        resource: PermissionResource.USERS,
        action: PermissionAction.LIST,
        displayName: 'لیست کاربران',
        code: 'users:list',
    },

    // ==================== نقش‌ها ====================
    ROLES_CREATE: {
        resource: PermissionResource.ROLES,
        action: PermissionAction.CREATE,
        code: 'roles:create',
        displayName: 'ایجاد نقش',
    },
    ROLES_READ: {
        resource: PermissionResource.ROLES,
        action: PermissionAction.READ,
        code: 'roles:read',
        displayName: 'مشاهده نقش',
    },
    ROLES_UPDATE: {
        resource: PermissionResource.ROLES,
        action: PermissionAction.UPDATE,
        code: 'roles:update',
        displayName: 'ویرایش نقش',
    },
    ROLES_DELETE: {
        resource: PermissionResource.ROLES,
        action: PermissionAction.DELETE,
        code: 'roles:delete',
        displayName: 'حذف نقش',
    },

    // ==================== خودروها ====================
    VEHICLES_CREATE: {
        resource: PermissionResource.VEHICLES,
        action: PermissionAction.CREATE,
        code: 'vehicles:create',
        displayName: 'ایجاد خودرو',
    },
    VEHICLES_READ: {
        resource: PermissionResource.VEHICLES,
        action: PermissionAction.READ,
        code: 'vehicles:read',
        displayName: 'مشاهده خودرو',
    },
    VEHICLES_UPDATE: {
        resource: PermissionResource.VEHICLES,
        action: PermissionAction.UPDATE,
        code: 'vehicles:update',
        displayName: 'ویرایش خودرو',
    },
    VEHICLES_DELETE: {
        resource: PermissionResource.VEHICLES,
        action: PermissionAction.DELETE,
        code: 'vehicles:delete',
        displayName: 'حذف خودرو',
    },
    VEHICLES_LIST: {
        resource: PermissionResource.VEHICLES,
        action: PermissionAction.LIST,
        code: 'vehicles:list',
        displayName: 'لیست خودروها',
    },

    // ==================== قراردادها ====================
    CONTRACTS_CREATE: {
        resource: PermissionResource.CONTRACTS,
        action: PermissionAction.CREATE,
        code: 'contracts:create',
        displayName: 'ایجاد قرارداد',
    },
    CONTRACTS_READ: {
        resource: PermissionResource.CONTRACTS,
        action: PermissionAction.READ,
        code: 'contracts:read',
        displayName: 'مشاهده قرارداد',
    },
    CONTRACTS_UPDATE: {
        resource: PermissionResource.CONTRACTS,
        action: PermissionAction.UPDATE,
        code: 'contracts:update',
        displayName: 'ویرایش قرارداد',
    },
    CONTRACTS_DELETE: {
        resource: PermissionResource.CONTRACTS,
        action: PermissionAction.DELETE,
        code: 'contracts:delete',
        displayName: 'حذف قرارداد',
    },
    CONTRACTS_APPROVE: {
        resource: PermissionResource.CONTRACTS,
        action: PermissionAction.APPROVE,
        code: 'contracts:approve',
        displayName: 'تایید قرارداد',
    },
    CONTRACTS_LIST: {
        resource: PermissionResource.CONTRACTS,
        action: PermissionAction.LIST,
        code: 'contracts:list',
        displayName: 'لیست قراردادها',
    },

    // ==================== پرداخت‌ها ====================
    PAYMENTS_READ: {
        resource: PermissionResource.PAYMENTS,
        action: PermissionAction.READ,
        code: 'payments:read',
        displayName: 'مشاهده پرداخت',
    },
    PAYMENTS_LIST: {
        resource: PermissionResource.PAYMENTS,
        action: PermissionAction.LIST,
        code: 'payments:list',
        displayName: 'لیست پرداخت‌ها',
    },
    PAYMENTS_CREATE: {
        resource: PermissionResource.PAYMENTS,
        action: PermissionAction.CREATE,
        code: 'payments:create',
        displayName: 'ثبت پرداخت',
    },

    // ==================== تنظیمات ====================
    SETTINGS_UPDATE: {
        resource: PermissionResource.SETTINGS,
        action: PermissionAction.UPDATE,
        code: 'settings:update',
        displayName: 'ویرایش تنظیمات',
    },
    SETTINGS_READ: {
        resource: PermissionResource.SETTINGS,
        action: PermissionAction.READ,
        code: 'settings:read',
        displayName: 'مشاهده تنظیمات',
    },

    // ==================== منوها ====================
    MENUS_CREATE: {
        resource: PermissionResource.MENUS,
        action: PermissionAction.CREATE,
        code: 'menus:create',
        displayName: 'ایجاد منو',
    },
    MENUS_READ: {
        resource: PermissionResource.MENUS,
        action: PermissionAction.READ,
        code: 'menus:read',
        displayName: 'مشاهده منو',
    },
    MENUS_UPDATE: {
        resource: PermissionResource.MENUS,
        action: PermissionAction.UPDATE,
        code: 'menus:update',
        displayName: 'ویرایش منو',
    },
    MENUS_DELETE: {
        resource: PermissionResource.MENUS,
        action: PermissionAction.DELETE,
        code: 'menus:delete',
        displayName: 'حذف منو',
    },

    // ==================== اسلایدرها ====================
    SLIDERS_CREATE: {
        resource: PermissionResource.SLIDERS,
        action: PermissionAction.CREATE,
        code: 'sliders:create',
        displayName: 'ایجاد اسلایدر',
    },
    SLIDERS_READ: {
        resource: PermissionResource.SLIDERS,
        action: PermissionAction.READ,
        code: 'sliders:read',
        displayName: 'مشاهده اسلایدر',
    },
    SLIDERS_UPDATE: {
        resource: PermissionResource.SLIDERS,
        action: PermissionAction.UPDATE,
        code: 'sliders:update',
        displayName: 'ویرایش اسلایدر',
    },
    SLIDERS_DELETE: {
        resource: PermissionResource.SLIDERS,
        action: PermissionAction.DELETE,
        code: 'sliders:delete',
        displayName: 'حذف اسلایدر',
    },

    // ==================== فوتر ====================
    FOOTERS_CREATE: {
        resource: PermissionResource.FOOTERS,
        action: PermissionAction.CREATE,
        code: 'footers:create',
        displayName: 'ایجاد فوتر',
    },
    FOOTERS_UPDATE: {
        resource: PermissionResource.FOOTERS,
        action: PermissionAction.UPDATE,
        code: 'footers:update',
        displayName: 'ویرایش فوتر',
    },
    FOOTERS_DELETE: {
        resource: PermissionResource.FOOTERS,
        action: PermissionAction.DELETE,
        code: 'footers:delete',
        displayName: 'حذف فوتر',
    },

    // ==================== گزارشات ====================
    REPORTS_READ: {
        resource: PermissionResource.REPORTS,
        action: PermissionAction.READ,
        code: 'reports:read',
        displayName: 'مشاهده گزارشات',
    },
    REPORTS_EXPORT: {
        resource: PermissionResource.REPORTS,
        action: PermissionAction.EXPORT,
        code: 'reports:export',
        displayName: 'خروجی گزارشات',
    },

    // ==================== ساب‌منوها ====================
    SUBMENUS_CREATE: {
        resource: PermissionResource.SUBMENUS,
        action: PermissionAction.CREATE,
        code: 'submenus:create',
        displayName: 'ایجاد ساب‌منو',
    },
    SUBMENUS_UPDATE: {
        resource: PermissionResource.SUBMENUS,
        action: PermissionAction.UPDATE,
        code: 'submenus:update',
        displayName: 'ویرایش ساب‌منو',
    },
    SUBMENUS_DELETE: {
        resource: PermissionResource.SUBMENUS,
        action: PermissionAction.DELETE,
        code: 'submenus:delete',
        displayName: 'حذف ساب‌منو',
    },

    // ==================== مگا منوها ====================
    MEGAMENUS_CREATE: {
        resource: PermissionResource.MEGAMENUS,
        action: PermissionAction.CREATE,
        code: 'megamenus:create',
        displayName: 'ایجاد مگا منو',
    },
    MEGAMENUS_UPDATE: {
        resource: PermissionResource.MEGAMENUS,
        action: PermissionAction.UPDATE,
        code: 'megamenus:update',
        displayName: 'ویرایش مگا منو',
    },
    MEGAMENUS_DELETE: {
        resource: PermissionResource.MEGAMENUS,
        action: PermissionAction.DELETE,
        code: 'megamenus:delete',
        displayName: 'حذف مگا منو',
    },
} as const;

/**
 * آرایه تمام دسترسی‌ها برای استفاده در Seed
 */
export const ALL_PERMISSIONS: PermissionDefinition[] = Object.values(PERMISSIONS);

/**
 * Helper برای دریافت کد دسترسی
 * @example getPermissionCode('users', 'create') // 'users:create'
 */
export function getPermissionCode(resource: PermissionResource, action: PermissionAction): string {
    return `${resource}:${action}`;
}

/**
 * Helper برای دریافت دسترسی بر اساس کد
 * @example getPermissionByCode('users:create')
 */
export function getPermissionByCode(code: string): PermissionDefinition | undefined {
    return ALL_PERMISSIONS.find(p => p.code === code);
}