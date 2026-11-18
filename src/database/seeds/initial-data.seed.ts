import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, RoleName } from '../entities/role.entity';
import { Permission, PermissionResource, PermissionAction } from '../entities/permission.entity';
import { User } from '../entities/user.entity';
import { Setting, SettingType } from '../entities/setting.entity';
import { Menu } from '../entities/menu.entity';
import { Submenu } from '../entities/sub-menu.entity';
import { Megamenu } from '../entities/mega-menu.entity';
import { ALL_PERMISSIONS } from '../../common/constants/permissions.constant';

export async function runSeed(dataSource: DataSource) {
    console.log('🌱 شروع فرآیند Seed دیتابیس...');

    const roleRepo = dataSource.getRepository(Role);
    const permissionRepo = dataSource.getRepository(Permission);
    const userRepo = dataSource.getRepository(User);
    const settingRepo = dataSource.getRepository(Setting);
    const menuRepo = dataSource.getRepository(Menu);
    const submenuRepo = dataSource.getRepository(Submenu);
    const megamenuRepo = dataSource.getRepository(Megamenu);

    try {
        // ==========================================
        // ۱. ساخت دسترسی‌ها (Permissions)
        // ==========================================
        console.log('🔹 در حال بررسی/ساخت دسترسی‌ها...');
        const permissions: Permission[] = [];

        for (const def of ALL_PERMISSIONS) {
            let perm = await permissionRepo.findOne({ where: { code: def.code } });
            if (!perm) {
                perm = permissionRepo.create(def);
                perm = await permissionRepo.save(perm);
            }
            permissions.push(perm);
        }
        console.log(`✅ ${permissions.length} دسترسی آماده است.`);

        // ==========================================
        // ۲. ساخت نقش‌ها (Roles)
        // ==========================================
        console.log('🔹 در حال بررسی/ساخت نقش‌ها...');
        const roleDefs = [
            {
                name: RoleName.SUPER_ADMIN,
                displayName: 'مدیر کل',
                description: 'دسترسی نامحدود به تمام بخش‌های سیستم',
                perms: permissions,
            },
            {
                name: RoleName.ADMIN,
                displayName: 'مدیر',
                description: 'مدیریت کاربران، خودروها و قراردادها',
                perms: permissions.filter(p => p.resource !== PermissionResource.ROLES),
            },
            {
                name: RoleName.OPERATOR,
                displayName: 'اپراتور محتوا',
                description: 'مدیریت منوها، ساب‌منوها، مگا منوها، اسلایدرها و تنظیمات سایت',
                perms: permissions.filter(p =>
                    [
                        PermissionResource.MENUS,
                        PermissionResource.SUBMENUS,
                        PermissionResource.MEGAMENUS,
                        PermissionResource.SLIDERS,
                        PermissionResource.FOOTERS,
                        PermissionResource.SETTINGS,
                    ].includes(p.resource),
                ),
            },
            {
                name: RoleName.SALES_CONSULTANT,
                displayName: 'مشاور فروش',
                description: 'ثبت خودرو و مدیریت قراردادها',
                perms: permissions.filter(p =>
                    [PermissionResource.VEHICLES, PermissionResource.CONTRACTS].includes(p.resource),
                ),
            },
            {
                name: RoleName.ACCOUNTANT,
                displayName: 'حسابدار',
                description: 'مشاهده پرداخت‌ها و گزارشات مالی',
                perms: permissions.filter(p =>
                    [PermissionResource.PAYMENTS, PermissionResource.REPORTS].includes(p.resource),
                ),
            },
            {
                name: RoleName.USER,
                displayName: 'کاربر عادی',
                description: 'دسترسی محدود به پنل کاربری',
                perms: permissions.filter(
                    p => p.resource === PermissionResource.USERS && p.action === PermissionAction.READ,
                ),
            },
        ];

        const savedRoles: Role[] = [];
        for (const def of roleDefs) {
            let role = await roleRepo.findOne({ where: { name: def.name }, relations: { permissions: true } });
            if (!role) {
                role = roleRepo.create({
                    name: def.name,
                    displayName: def.displayName,
                    description: def.description,
                    permissions: def.perms,
                });
                role = await roleRepo.save(role);
            } else {
                role.permissions = def.perms;
                await roleRepo.save(role);
            }
            savedRoles.push(role);
        }
        console.log(`✅ ${savedRoles.length} نقش آماده است.`);

        // ==========================================
        // ۳. ساخت Super Admin
        // ==========================================
        console.log('🔹 در حال بررسی/ساخت کاربر Super Admin...');
        const superAdminRole = savedRoles.find(r => r.name === RoleName.SUPER_ADMIN);

        const superAdminPhone = process.env.SUPER_ADMIN_PHONE || '09120000000';
        const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345';
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@mobinkhodro.com';
        const superAdminFirstName = process.env.SUPER_ADMIN_FIRST_NAME || 'مدیر';
        const superAdminLastName = process.env.SUPER_ADMIN_LAST_NAME || 'کل';

        let adminUser = await userRepo.findOne({
            where: { phone: superAdminPhone },
            relations: { roles: true },
        });

        if (!adminUser) {
            const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
            adminUser = userRepo.create({
                phone: superAdminPhone,
                password: hashedPassword,
                firstName: superAdminFirstName,
                lastName: superAdminLastName,
                email: superAdminEmail,
                isVerified: true,
                isActive: true,
                roles: superAdminRole ? [superAdminRole] : [],
            });
            await userRepo.save(adminUser);
            console.log('✅ کاربر Super Admin ساخته شد:');
            console.log(`   📱 شماره: ${superAdminPhone}`);
            console.log(`   🔑 رمز عبور: ${superAdminPassword}`);
            console.log(`   📧 ایمیل: ${superAdminEmail}`);
        } else {
            console.log(`ℹ️  کاربر Super Admin با شماره ${superAdminPhone} از قبل وجود دارد.`);
        }

        // ==========================================
        // ۴. تنظیمات پیش‌فرض (شامل لوگو)
        // ==========================================
        console.log('🔹 در حال بررسی/ساخت تنظیمات پیش‌فرض...');
        const defaultSettings = [
            {
                key: 'site_name',
                value: 'مبین خودرو',
                type: SettingType.STRING,
                group: 'general',
                displayName: 'نام سایت',
                isPublic: true,
            },
            {
                key: 'site_logo',
                value: 'https://via.placeholder.com/150x50?text=Mobin+Khodro',
                type: SettingType.IMAGE,
                group: 'general',
                displayName: 'لینک لوگوی سایت',
                isPublic: true,
            },
            {
                key: 'contact_phone',
                value: '021-12345678',
                type: SettingType.STRING,
                group: 'contact',
                displayName: 'شماره تماس پشتیبانی',
                isPublic: true,
            },
            {
                key: 'contact_address',
                value: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
                type: SettingType.STRING,
                group: 'contact',
                displayName: 'آدرس دفتر مرکزی',
                isPublic: true,
            },
            {
                key: 'contact_email',
                value: 'info@mobinkhodro.com',
                type: SettingType.STRING,
                group: 'contact',
                displayName: 'ایمیل پشتیبانی',
                isPublic: true,
            },
            {
                key: 'seo_description',
                value: 'فروش اقساطی انواع خودروهای داخلی و خارجی با بهترین شرایط',
                type: SettingType.STRING,
                group: 'seo',
                displayName: 'توضیحات متا (SEO)',
                isPublic: true,
            },
            {
                key: 'seo_keywords',
                value: 'فروش اقساطی خودرو, مبین خودرو, خرید خودرو, اقساط خودرو',
                type: SettingType.STRING,
                group: 'seo',
                displayName: 'کلمات کلیدی (SEO)',
                isPublic: true,
            },
        ];

        for (const def of defaultSettings) {
            const exists = await settingRepo.findOne({ where: { key: def.key } });
            if (!exists) {
                await settingRepo.save(settingRepo.create(def));
            }
        }
        console.log('✅ تنظیمات پیش‌فرض ثبت شد.');

        // ==========================================
        // ۵. منوی پیش‌فرض (ساختار چندسطحی کامل)
        // ==========================================
        console.log('🔹 در حال بررسی/ساخت منوی پیش‌فرض...');
        const menuCount = await menuRepo.count();

        if (menuCount === 0) {
            // ---- منوی اصلی ۱: صفحه اصلی ----
            const homeMenu = menuRepo.create({
                title: 'صفحه اصلی',
                url: '/',
                order: 1,
                isActive: true,
            });
            await menuRepo.save(homeMenu);

            // ---- منوی اصلی ۲: محصولات (مگا منو) ----
            const productsMenu = menuRepo.create({
                title: 'محصولات',
                url: null,
                order: 2,
                isActive: true,
            });
            const savedProductsMenu = await menuRepo.save(productsMenu);

            // ✅ ساب‌منو: خودروهای داخلی (استفاده از آبجکت menu به جای menuId)
            const domesticSubmenu = submenuRepo.create({
                title: 'خودروهای داخلی',
                url: '/vehicles/domestic',
                order: 1,
                isActive: true,
                menu: savedProductsMenu, // ← تغییر حیاتی: پاس دادن آبجکت
            });
            const savedDomesticSubmenu = await submenuRepo.save(domesticSubmenu);

            // ✅ مگا منوهای زیر خودروهای داخلی (استفاده از آبجکت submenu)
            const domesticBrands = [
                { title: 'فروش اقساطی ایران خودرو', url: '/vehicles/iran-khodro', order: 1 },
                { title: 'فروش اقساطی سایپا', url: '/vehicles/saipa', order: 2 },
                { title: 'فروش اقساطی فونیکس تیگو', url: '/vehicles/fox-tigo', order: 3 },
                { title: 'فروش اقساطی لوکسانو', url: '/vehicles/luxano', order: 4 },
                { title: 'فروش اقساطی لاماری', url: '/vehicles/lamari', order: 5 },
            ];

            for (const brand of domesticBrands) {
                await megamenuRepo.save(
                    megamenuRepo.create({
                        ...brand,
                        submenu: savedDomesticSubmenu, // ← تغییر حیاتی: پاس دادن آبجکت
                    }),
                );
            }

            // ✅ ساب‌منو: خودروهای وارداتی
            const importedSubmenu = submenuRepo.create({
                title: 'خودروهای وارداتی',
                url: '/vehicles/imported',
                order: 2,
                isActive: true,
                menu: savedProductsMenu, // ← تغییر حیاتی: پاس دادن آبجکت
            });
            const savedImportedSubmenu = await submenuRepo.save(importedSubmenu);

            // ✅ مگا منوهای زیر خودروهای وارداتی
            const importedBrands = [
                { title: 'فروش اقساطی تویوتا', url: '/vehicles/toyota', order: 1 },
                { title: 'فروش اقساطی هیوندای', url: '/vehicles/hyundai', order: 2 },
                { title: 'فروش اقساطی کیا', url: '/vehicles/kia', order: 3 },
                { title: 'فروش اقساطی ام وی ام', url: '/vehicles/mvm', order: 4 },
            ];

            for (const brand of importedBrands) {
                await megamenuRepo.save(
                    megamenuRepo.create({
                        ...brand,
                        submenu: savedImportedSubmenu, // ← تغییر حیاتی: پاس دادن آبجکت
                    }),
                );
            }

            // ---- منوهای اصلی دیگر ----
            const otherMenus = [
                { title: 'خدمات', url: '/services', order: 3 },
                { title: 'مقالات', url: '/articles', order: 4 },
                { title: 'درباره ما', url: '/about', order: 5 },
                { title: 'تماس با ما', url: '/contact', order: 6 },
            ];

            for (const m of otherMenus) {
                await menuRepo.save(menuRepo.create({ ...m, isActive: true }));
            }

            console.log('✅ منوی پیش‌فرض با ساختار چندسطحی ثبت شد:');
            console.log('   📁 ۶ منوی اصلی');
            console.log('   📂 ۲ ساب‌منو (خودروهای داخلی/وارداتی)');
            console.log('   📄 ۹ مگا منو (برندهای خودرو)');
        } else {
            console.log('ℹ️  منو از قبل وجود دارد.');
        }

        console.log('🎉 فرآیند Seed با موفقیت و بدون خطا تکمیل شد!');
    } catch (error) {
        console.error('❌ خطا در فرآیند Seed:', error);
        throw error;
    }
}

// اجرای مستقل
if (require.main === module) {
    (async () => {
        const { config } = require('dotenv');
        config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

        const { default: AppDataSource } = require('../data-source');

        await AppDataSource.initialize();
        console.log('Connected to database.');

        await runSeed(AppDataSource);

        await AppDataSource.destroy();
        process.exit(0);
    })();
}